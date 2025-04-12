import { Node } from "./node";
import { TypedInput } from "./typed-input";
import * as Credential from "./credential";
import camelCase from "camelcase";

/**
 * Creates a mixin to extend Node-RED's node registration functionality.
 * This mixin ensures that the RED object is available in the class scope,
 * automatically registers the node and its event handlers.
 *
 * @param {object} RED - The Node-RED runtime object. It provides methods to register and manage nodes.
 * @returns {function} - A higher-order function that takes a base class and returns a new class with additional Node-RED functionalities.
 */
export function createNodeRedNodeFactory(RED) {
  return async function (BaseClass) {
    if (!(BaseClass.prototype instanceof Node)) {
      throw new Error(`${BaseClass.name} must extend Node`);
    }

    const type = BaseClass.__nodeProperties___.type;
    if (!type) {
      throw new Error(
        `${type} must be provided with @Node decorator in your class`
      );
    }

    if (Node.RED === undefined) {
      Object.defineProperty(Node, "RED", {
        value: RED,
        writable: false,
        configurable: false,
      });
    }

    if (BaseClass.RED === undefined) {
      Object.defineProperty(BaseClass, "RED", {
        value: RED,
        writable: false,
        configurable: false,
      });
    }

    if (BaseClass.type === undefined) {
      Object.defineProperty(BaseClass, "type", {
        value: type,
        writable: false,
        configurable: false,
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
      /**
       * Creates an instance of a given node class and injects the RED object in it
       * @param {object} config - Configuration object for the node-red node instance.
       */
      constructor(config) {
        super(config);

        console.log("INSIDE MIXIN");
        console.log(config);
        this.setupEventHandlers();
        this.assignDecoratedProps();

        console.log(this);
      }

      /**
       * Sets up event handlers for the node. Automatically binds methods starting with "on" from the base class
       * to their corresponding events.
       */
      private setupEventHandlers() {
        ["onInput", "onClose"].forEach((methodName) => {
          this.on(
            methodName.split("on")[1].toLocaleLowerCase(),
            this[methodName]
          );
        });
      }

      private assignDecoratedProps() {
        const ctor = this.constructor as any;
        const props = ctor.__inputs__ || [];
        console.log("INSIDE DECORATED PROPS METHOD");
        for (const { key, options } of props) {
          console.log("options");
          console.log(options);
          this[key] = options.configNodeType
            ? RED.nodes.getNode(this.__config[key])
            : options.isTypedInput
              ? new TypedInput(this, this.__config[key])
              : options.isPasswordCredential
                ? new Credential.Password(this.credentials[key])
                : options.isTextCredential
                  ? new Credential.Text(this.credentials[key])
                  : this.__config[key];
        }

        delete this.credentials;

        console.log("FINISHED ASSIGNING PROPS");
      }

      private validateConfig() {
        for (const { key, required, validate, type } of this.constructor
          .__inputs__ || []) {
          console.log(type);
          const value = isTypedInput(type) ? this[key].value : this[key];

          if (required && (value === undefined || value === "")) {
            throw new Error(`${key} is required.`);
          }

          if (validate) {
            const result = validate(value);
            if (result !== true) {
              throw new Error(
                `Validation failed for ${key}:  ${result} [${value}]`
              );
            }
          }
        }
      }
    };

    const defaults = function () {
      return classRegistry["_BaseClass"]?.__inputs__
        ? classRegistry["_BaseClass"].__inputs__.reduce(
            (acc, { key, options }) => {
              if (options.isTextCredential || options.isPasswordCredential)
                return acc;
              acc[key] = {
                value: "",
                type: options.configNodeType
                  ? options.configNodeType
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
            (acc, { key, options }) => {
              if (options.isPasswordCredential) {
                acc[key] = {
                  type: "password",
                };
              }

              if (options.isTextCredential) {
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

    return classRegistry["_BaseClass"];
  };
}
