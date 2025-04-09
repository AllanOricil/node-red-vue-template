import { NodeRedNode, TypedInput } from "./node";
import camelCase from "camelcase";

/**
 * Creates a mixin to extend Node-RED's node registration functionality.
 * This mixin ensures that the RED object is available in the class scope,
 * automatically registers the node and its event handlers.
 *
 * @param {object} RED - The Node-RED runtime object. It provides methods to register and manage nodes.
 * @returns {function} - A higher-order function that takes a base class and returns a new class with additional Node-RED functionalities.
 */
export function createNodeRedNodeMixin(RED) {
  return async function (BaseClass, type) {
    if (!(BaseClass.prototype instanceof NodeRedNode)) {
      throw new Error(`${BaseClass.name} must extend Node`);
    }

    if (!type) {
      throw new Error(`${type} must be provided`);
    }

    if (NodeRedNode.RED === undefined) {
      Object.defineProperty(NodeRedNode, "RED", {
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
        const props = ctor.__configProps__ || [];
        for (const { key, options } of props) {
          this[key] = options?.configNode
            ? NodeRedNode.getNode(this.__config[key])
            : options.typedInput
              ? new TypedInput(this, this.__config[key])
              : this.__config[key];
        }

        const secrets = ctor.__secrets__ || [];
        for (const { key } of secrets) {
          this[key] = this.credentials[key];
        }
        delete this.credentials;

        console.log("FINISHED ASSIGNING PROPS");
      }

      private validateConfig() {
        for (const { key, required, validate, type } of this.constructor
          .__configProps__ || []) {
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

    const defaults = classRegistry["_BaseClass"]?.__configProps__
      ? classRegistry["_BaseClass"].__configProps__.reduce((acc, { key }) => {
          acc[key] = {
            value: "",
          };
          return acc;
        }, {})
      : {};

    const credentials = classRegistry["_BaseClass"]?.__secrets__
      ? classRegistry["_BaseClass"].__secrets__.reduce(
          (acc, { key, type, required }) => {
            acc[key] = {
              type,
              required,
            };
            return acc;
          },
          {}
        )
      : {};

    RED.nodes.registerType(type, classRegistry["_BaseClass"], {
      credentials,
    });

    RED.httpAdmin.get(`/${type}`, function (req, res) {
      let editorProperties =
        { ...classRegistry["_BaseClass"].editorProperties } || {};
      editorProperties.defaults = defaults;
      editorProperties.credentials = credentials;
      res.json(editorProperties);
    });

    return classRegistry["_BaseClass"];
  };
}
