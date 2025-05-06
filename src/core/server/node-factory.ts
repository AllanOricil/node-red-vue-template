import camelCase from "camelcase";
import { ValidatorService } from "../validator-service";
import { merge } from "es-toolkit";
import { Node } from "./node";
import { isSubclassOf, convertToType } from "./utils";
import { getDefaultsFromSchema, getCredentialsFromSchema } from "../utils";
import { Type } from "@sinclair/typebox";

// NOTE: singleton to use ajv caching features
const validatorService = new ValidatorService();

// TODO: define RED type
/**
 * Registers a custom node built with the nrg framework
 * @static
 * @async
 * @param {object} RED - The Node-RED runtime API object
 * @param {(Node)} NodeClass - A node class extending Node
 * @returns {Promise<void>} A promise that resolves when the node type registration and setup are complete. It might wait for the `NodeClass.init()` promise if one is returned.
 * @throws {Error} If NodeClass does not extend `Node`
 * @throws {Error} If type is note defined
 */
export async function registerType(RED: any, type: string, NodeClass: Node) {
  if (!(NodeClass.prototype instanceof Node)) {
    throw new Error(`${NodeClass.name} must extend Node class`);
  }

  if (!type) {
    throw new Error(`type must be provided when registering the node`);
  }

  // TODO: move this somewhere else. There is no need to run it every time the function is called
  if (Node.RED === undefined) {
    Object.defineProperty(Node, "RED", {
      value: RED,
      writable: false,
      configurable: false,
      enumerable: false,
    });
  }

  if (NodeClass.RED === undefined) {
    Object.defineProperty(NodeClass, "RED", {
      value: RED,
      writable: false,
      configurable: false,
      enumerable: false,
    });
  }

  if (NodeClass.type === undefined) {
    Object.defineProperty(NodeClass, "type", {
      value: type,
      writable: false,
      configurable: false,
      enumerable: false,
    });
  }

  console.log("NodeClass");
  console.log(NodeClass);
  if (typeof NodeClass.init === "function") {
    const result = NodeClass.init();

    if (result instanceof Promise) {
      await result;
    }
  }

  // NOTE: this preserves the original class name
  const classRegistry = {};
  classRegistry["_NodeClass"] = class extends NodeClass {
    /**
     * Creates an instance of a given node class and injects the RED object in it
     * @param {object} configs - Configuration object for the node-red node instance.
     */
    constructor(configs) {
      super(configs);

      if (NodeClass.__nodeProperties___.validation?.configs) {
        console.log("validating configs");
        console.log(this.configs);
        console.log(this);
        const validator = validatorService.createValidator(
          NodeClass.__nodeProperties___.validation?.configs
        );
        const isConfigsValid = validator(this.configs);
        if (!isConfigsValid) {
          const errors = validatorService.errors(validator.errors, {
            separator: "\n",
            dataVar: "- configs",
          });
          console.error(errors);
        }
      }

      if (NodeClass.__nodeProperties___.validation?.credentials) {
        console.log("validating credentials");
        const validator = validatorService.createValidator(
          NodeClass.__nodeProperties___.validation?.credentials
        );
        const isCredentialsValid = validator(this.credentials);
        if (!isCredentialsValid) {
          const errors = validatorService.errors(validator.errors, {
            separator: "\n",
            dataVar: "- credentials",
          });
          console.error(errors);
        }
      }

      console.log("SETUP EVENT HANDLERS");
      this.setupEventHandlers();
    }

    /**
     * Sets up event handlers for the node. Automatically binds methods starting with "on" from the base class
     * to their corresponding events.
     */
    private setupEventHandlers() {
      console.log("INSIDE SETUPTEVENTHANDLERS");
      if (this.onInput) {
        console.log("REGISTERING ON INPUT");
        this.on("input", async (msg, send, done) => {
          try {
            const inputSchema = NodeClass.__nodeProperties___.validation?.input;
            if (inputSchema) {
              console.log("validating message");
              const messageValidator =
                validatorService.createValidator(inputSchema);
              const isValid = messageValidator(msg);
              if (!isValid) {
                const errors = validatorService.errors(
                  messageValidator.errors,
                  {
                    separator: "\n",
                    dataVar: "- message",
                  }
                );
                console.error(errors);
                return done(errors);
              }
            }

            await Promise.resolve(this.onInput(msg, send, done));
          } catch (error) {
            this.error("Error while processing input: " + error.message, msg);
            done(error);
          }
        });
      }
      if (this.onClose) {
        this.on("close", this.onClose);
      }
    }
  };

  function defaults() {
    const schema = NodeClass.__nodeProperties___.validation?.configs;
    return schema ? getDefaultsFromSchema(schema) : {};
  }

  function credentials() {
    const schema = NodeClass.__nodeProperties___.validation?.credentials;
    return schema ? getCredentialsFromSchema(schema) : {};
  }

  RED.nodes.registerType(type, classRegistry["_NodeClass"], {
    credentials: credentials(),
  });

  RED.httpAdmin.get(`/nrg/nodes/${type}`, function (req, res) {
    const nodeProperties =
      { ...classRegistry["_NodeClass"].__nodeProperties___ } || {};

    nodeProperties.schema = Type.Object({
      ...classRegistry["_NodeClass"].__nodeProperties___.validation.configs
        ?.properties,
      credentials: Type.Object({
        ...classRegistry["_NodeClass"].__nodeProperties___.validation
          .credentials?.properties,
      }),
    });
    res.json(nodeProperties);
  });
}
