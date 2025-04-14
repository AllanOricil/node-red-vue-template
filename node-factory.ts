import Ajv, { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { deepmerge } from "deepmerge-ts";
import { Node } from "./node";
import { ConfigNode } from "./config-node";
import { TypedInput } from "./typed-input";
import * as Credential from "./credential";
import camelCase from "camelcase";
import { isSubclassOf, convertToType } from "./utils";

/**
 * @class NodeFactory
 * @description Provides a static method to simplify the registration of custom Node-RED
 * node classes developed using the nrg framework. It handles the
 * boilerplate integration with the Node-RED runtime, including type registration,
 * property injection, event handling setup, and admin endpoint creation.
 */
export class NodeFactory {
  /**
   * Registers a custom node built with the nrg framework
   * @static
   * @async
   * @param {object} RED - The Node-RED runtime API object
   * @param {(Node | ConfigNode)} BaseClass - A node class extending Node or ConfigNode
   * @returns {Promise<void>} A promise that resolves when the node type registration and setup are complete. It might wait for the `BaseClass.init()` promise if one is returned.
   * @throws {Error} If BaseClass does not extend `Node` or `ConfigNode`.
   * @throws {Error} If BaseClass does not provide @node({type: "node-type"})
   */
  static async createNode(RED: any, BaseClass: Node | ConfigNode) {
    if (
      !(
        BaseClass.prototype instanceof Node ||
        BaseClass.prototype instanceof ConfigNode
      )
    ) {
      throw new Error(`${BaseClass.name} must extend Node`);
    }

    const type = BaseClass.__nodeProperties___.type;
    if (!type) {
      throw new Error(
        `${type} must be provided with @node decorator in your class`
      );
    }

    if (Node.RED === undefined) {
      Object.defineProperty(Node, "RED", {
        value: RED,
        writable: false,
        configurable: false,
        enumerable: false,
      });
    }

    if (ConfigNode.RED === undefined) {
      Object.defineProperty(ConfigNode, "RED", {
        value: RED,
        writable: false,
        configurable: false,
        enumerable: false,
      });
    }

    if (BaseClass.RED === undefined) {
      Object.defineProperty(BaseClass, "RED", {
        value: RED,
        writable: false,
        configurable: false,
        enumerable: false,
      });
    }

    if (BaseClass.type === undefined) {
      Object.defineProperty(BaseClass, "type", {
        value: type,
        writable: false,
        configurable: false,
        enumerable: false,
      });
    }

    console.log("BASECLASS");
    console.log(BaseClass);
    if (typeof BaseClass.init === "function") {
      const result = BaseClass.init();

      if (result instanceof Promise) {
        await result;
      }
    }

    // NOTE: if I assign the extended class to a constant the class name becomes the name of the contant. To avoid losing the BaseClass name I'm storing it in a object prop. Somehow js maintains the name of the BaseClass when I do it
    const classRegistry = {};
    classRegistry["_BaseClass"] = class extends BaseClass {
      private static ajv: Ajv | null = null;
      private static inputsValidator: ValidateFunction | null = null;
      private static messageValidator: ValidateFunction | null = null;

      /**
       * Creates an instance of a given node class and injects the RED object in it
       * @param {object} config - Configuration object for the node-red node instance.
       */
      constructor(config) {
        super(config);

        const inputs = deepmerge(config, this.credentials);
        console.log(inputs);
        this.validateInputs(inputs);
        this.setupEventHandlers();
        this.assignDecoratedProps();
      }

      /**
       * Sets up event handlers for the node. Automatically binds methods starting with "on" from the base class
       * to their corresponding events.
       */
      private setupEventHandlers() {
        // TODO: make this dynamic again?
        // ["onInput", "onClose"].forEach((methodName) => {
        //   this.on(
        //     methodName.split("on")[1].toLocaleLowerCase(),
        //     this[methodName]
        //   );
        // });

        this.on("input", (msg, send, done) => {
          try {
            this.validateMessage(msg);
            this.onInput(msg, send, done);
          } catch (err) {
            this.error("Error during input processing: " + err.message, msg);
            if (done) {
              done(err);
            }
          }
        });
        this.on("close", this.onClose);
      }

      private assignDecoratedProps() {
        const ctor = this.constructor as any;
        const props = ctor.__inputs__ || [];
        console.log("INSIDE DECORATED PROPS METHOD");
        for (const { key, type } of props) {
          // TODO: try prop acessors
          this[key] = isSubclassOf(type, ConfigNode)
            ? RED.nodes.getNode(this.__config[key])
            : type === TypedInput
              ? new TypedInput(this, this.__config[key])
              : type === Credential.Password || type === Credential.Text
                ? convertToType(this.credentials[key], type)
                : convertToType(this.__config[key], type);
        }

        delete this.credentials;

        console.log("FINISHED ASSIGNING PROPS");
      }

      private validateInputs(inputs: any) {
        console.log("INSIDE VALIDATE INPUT SCHEMA");
        console.log(this.constructor.__nodeProperties___?.schemas?.inputs);

        const schema = this.constructor.__nodeProperties___?.schemas?.inputs;

        if (!schema) {
          console.log("Nothing to be validated");
          return;
        }

        if (!this.inputsValidator) {
          this.ajv = new Ajv({
            allErrors: true,
            useDefaults: true,
            strict: true,
            coerceTypes: true,
            verbose: true,
            validateFormats: true,
          });

          addFormats(this.ajv);

          this.inputsValidator = this.ajv.compile(schema);

          console.log("COMPILED");
        }

        const isValid = this.inputsValidator(inputs);
        if (!isValid) {
          const errorDetails = this.ajv?.errorsText(
            this.inputsValidator.errors,
            {
              separator: "\n",
              dataVar: "- inputs",
            }
          );
          console.log(errorDetails);
          return;
        }
        console.log("ALL GOOD");
      }

      private validateMessage(message: Record<string, any>) {
        console.log("VALIDATING MESSAGE");
        const schema = this.constructor.__nodeProperties___?.schemas?.message;
        if (!schema) {
          console.log("Nothing to be validated");
          return;
        }

        if (!this.messageValidator) {
          this.ajv = new Ajv({
            allErrors: true,
            useDefaults: true,
            strict: true,
            coerceTypes: true,
            verbose: true,
            validateFormats: true,
          });
          addFormats(this.ajv);

          this.messageValidator = this.ajv.compile(schema);

          console.log("COMPILED");
        }

        const isValid = this.messageValidator(message);
        if (!isValid) {
          const errorDetails = this.ajv?.errorsText(
            this.messageValidator.errors,
            {
              separator: "\n",
              dataVar: "- message",
            }
          );
          console.log(errorDetails);
          return;
        }
        console.log("ALL GOOD WITH MESSAGE");
      }
    };

    const defaults = function () {
      return classRegistry["_BaseClass"]?.__inputs__
        ? classRegistry["_BaseClass"].__inputs__.reduce(
            (acc, { key, type }) => {
              if (type === Credential.Password || type === Credential.Text)
                return acc;

              acc[key] = {
                value: "",
                type: isSubclassOf(type, ConfigNode)
                  ? type.__nodeProperties___.type
                  : undefined,
              };
              return acc;
            },
            {}
          )
        : {};
    };

    const credentials = function () {
      return classRegistry["_BaseClass"]?.__inputs__
        ? classRegistry["_BaseClass"].__inputs__.reduce(
            (acc, { key, type }) => {
              if (type === Credential.Password) {
                acc[key] = {
                  type: "password",
                };
              }

              if (type === Credential.Text) {
                acc[key] = {
                  type: "text",
                };
              }
              return acc;
            },
            {}
          )
        : {};
    };

    RED.nodes.registerType(type, classRegistry["_BaseClass"], {
      credentials: credentials(),
    });

    RED.httpAdmin.get(`/${type}`, function (req, res) {
      let nodeProperties =
        { ...classRegistry["_BaseClass"].__nodeProperties___ } || {};
      nodeProperties.defaults = defaults();
      nodeProperties.credentials = credentials();
      res.json(nodeProperties);
    });
  }
}
