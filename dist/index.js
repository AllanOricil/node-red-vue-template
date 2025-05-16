"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const addErrors = require("ajv-errors");
const typebox = require("@sinclair/typebox");
class ValidatorService {
  constructor(options) {
    this.ajv = new Ajv({
      allErrors: true,
      useDefaults: "empty",
      verbose: true,
      validateFormats: true,
      strict: true,
      coerceTypes: true,
      ...options
    });
    console.log(this.ajv.schemas);
    addFormats(this.ajv);
    addErrors(this.ajv);
    this.ajv.addKeyword("nodeType");
  }
  createValidator(schema) {
    return this.ajv.compile(schema);
  }
  errors(errors, options) {
    return this.ajv.errorsText(errors, options);
  }
}
const validatorService = new ValidatorService();
class Node {
  constructor(configs) {
    Node.RED.nodes.createNode(this, configs);
    this.configs = configs;
    this.id = configs.id;
    this.type = configs.type;
    this.name = configs.name;
    this.z = configs.z;
    this.g = configs.g;
    if (Node.validations?.configs) {
      console.log("validating configs");
      console.log(this.configs);
      console.log(this);
      const validator = validatorService.createValidator(
        Node.validations?.configs
      );
      const isConfigsValid = validator(this.configs);
      if (!isConfigsValid) {
        const errors = validatorService.errors(validator.errors, {
          separator: "\n",
          dataVar: "- configs"
        });
        console.error(errors);
      }
    }
    if (Node.validations?.credentials) {
      console.log("validating credentials");
      const validator = validatorService.createValidator(
        Node.validations?.credentials
      );
      const isCredentialsValid = validator(this.credentials);
      if (!isCredentialsValid) {
        const errors = validatorService.errors(validator.errors, {
          separator: "\n",
          dataVar: "- credentials"
        });
        console.error(errors);
      }
    }
  }
  static init() {
    console.log("not implemented");
  }
  static getNode(id) {
    return this.RED.nodes.getNode(id);
  }
}
class IONode extends Node {
  constructor(configs) {
    super(configs);
    this.x = configs.x;
    this.y = configs.y;
    this.wires = configs.wires || [[]];
    console.log("SETUP EVENT HANDLERS");
    this.setupEventHandlers();
  }
  /**
   * Sets up event handlers for the node. Automatically binds methods starting with "on" from the base class
   * to their corresponding events.
   */
  setupEventHandlers() {
    console.log("INSIDE SETUPTEVENTHANDLERS");
    if (this.onInput) {
      console.log("REGISTERING ON INPUT");
      this.on(
        "input",
        async (msg, send, done) => {
          try {
            const inputSchema = IONode.validations?.input;
            if (inputSchema) {
              console.log("validating message");
              const messageValidator = validatorService.createValidator(inputSchema);
              const isValid = messageValidator(msg);
              if (!isValid) {
                const errors = validatorService.errors(
                  messageValidator.errors,
                  {
                    separator: "\n",
                    dataVar: "- message"
                  }
                );
                console.error(errors);
                return done(errors);
              }
            }
            await Promise.resolve(this.onInput(msg, send, done));
          } catch (error) {
            if (error instanceof Error) {
              this.error("Error while processing input: " + error.message, msg);
              done(error);
            } else {
              this.error("Unknown error occurred during input handling", msg);
              done("Unknown error occurred during input handling");
            }
          }
        }
      );
    }
    if (this.onClose) {
      this.on("close", this.onClose);
    }
  }
}
class ConfigNode extends Node {
  constructor(configs) {
    super(configs);
    this.users = configs._users || [];
  }
}
const NodeConfigsSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  type: typebox.Type.String(),
  name: typebox.Type.String(),
  g: typebox.Type.Optional(typebox.Type.String()),
  z: typebox.Type.Optional(typebox.Type.String())
});
const ConfigNodeConfigsSchema = typebox.Type.Object({
  ...NodeConfigsSchema.properties,
  _users: typebox.Type.Array(typebox.Type.String())
});
const MessageSchema = typebox.Type.Object({
  payload: typebox.Type.Optional(typebox.Type.String()),
  topic: typebox.Type.Optional(typebox.Type.String()),
  _msgid: typebox.Type.Optional(typebox.Type.String())
});
const IONodeConfigsSchema = typebox.Type.Object({
  ...NodeConfigsSchema.properties,
  wires: typebox.Type.Array(typebox.Type.Array(typebox.Type.String(), { default: [] }), {
    default: [[]]
  }),
  x: typebox.Type.Number(),
  y: typebox.Type.Number()
});
const TYPED_INPUT_TYPES = [
  "msg",
  "flow",
  "global",
  "str",
  "num",
  "bool",
  "json",
  "bin",
  "re",
  "jsonata",
  "date",
  "env",
  "node",
  "cred"
];
const TypedInputTypeLiterals = TYPED_INPUT_TYPES.map(
  (type) => typebox.Type.Literal(type)
);
const TypedInputSchema = typebox.Type.Object(
  {
    value: typebox.Type.Union(
      [typebox.Type.String(), typebox.Type.Number(), typebox.Type.Boolean(), typebox.Type.Null()],
      {
        description: "The actual value entered or selected.",
        default: ""
      }
    ),
    type: typebox.Type.Union(TypedInputTypeLiterals, {
      description: "The type of the value (string, number, message property, etc.)",
      default: "str"
    })
  },
  {
    description: "Represents a Node-RED TypedInput value and its type.",
    default: {
      type: "str",
      value: ""
    }
  }
);
const ConfigsSchema$1 = typebox.Type.Object(
  {
    ...IONodeConfigsSchema.properties,
    name: typebox.Type.String({ default: "your-node" }),
    myProperty: TypedInputSchema,
    myProperty2: TypedInputSchema,
    remoteServer: typebox.Type.String({ nodeType: "remote-server" }),
    anotherRemoteServer: typebox.Type.Optional(
      typebox.Type.String({ nodeType: "remote-server" })
    ),
    country: typebox.Type.String({ default: "brazil" }),
    fruit: typebox.Type.Array(typebox.Type.String(), { default: ["apple", "melon"] }),
    number: typebox.Type.String({ default: "1" }),
    object: typebox.Type.Array(typebox.Type.String(), {
      default: [JSON.stringify({ test: "a" }), JSON.stringify({ test: "b" })]
    }),
    array: typebox.Type.String({
      default: '["a"]'
    }),
    jsontest: typebox.Type.String({ default: "" }),
    csstest: typebox.Type.String({ default: "" })
  },
  {
    $id: "YourNodeConfigsSchema"
  }
);
const CredentialsSchema = typebox.Type.Object(
  {
    password: typebox.Type.Optional(
      typebox.Type.String({
        default: "",
        minLength: 8,
        maxLength: 20,
        pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.source,
        format: "password"
      })
    ),
    password2: typebox.Type.Optional(
      typebox.Type.String({
        default: "",
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.source,
        format: "password"
      })
    ),
    username: typebox.Type.Optional(
      typebox.Type.String({ default: "", maxLength: 10, minLength: 5 })
    )
  },
  {
    $id: "YourNodeCredentialsSchema"
  }
);
const InputMessageSchema = typebox.Type.Intersect(
  [
    MessageSchema,
    typebox.Type.Object({
      myVariable: typebox.Type.Optional(typebox.Type.String())
    })
  ],
  {
    $id: "YourNodeInputMessageSchema"
  }
);
const OutputMessageSchema = typebox.Type.Intersect(
  [
    MessageSchema,
    typebox.Type.Object({
      originalType: typebox.Type.Union([
        typebox.Type.Literal("string"),
        typebox.Type.Literal("number")
      ]),
      processedTime: typebox.Type.Number()
    }),
    typebox.Type.Unknown()
  ],
  { $id: "YourNodeOutputMessageSchema" }
);
class YourNode extends IONode {
  static validations = {
    configs: ConfigsSchema$1,
    credentials: CredentialsSchema,
    input: InputMessageSchema,
    outputs: OutputMessageSchema
  };
  static async init() {
    console.log("testing your-node node init");
    try {
      const response = await fetch("https://dog.ceo/api/breeds/image/random");
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      console.log(json);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error while fetching dogs: ", error.message);
      } else {
        console.error("Unknown error occurred: ", error);
      }
    }
  }
  async onInput(msg, send, done) {
    console.log(this);
    console.log(msg);
    const server = IONode.getNode(
      this.configs.remoteServer
    );
    console.log(server?.users);
    const outputMsg = {
      originalType: "number",
      processedTime: 1
    };
    send(outputMsg);
    done();
  }
  async onClose(removed, done) {
    console.log("removing node");
    done();
  }
}
const ConfigsSchema = typebox.Type.Object(
  {
    ...ConfigNodeConfigsSchema.properties,
    name: typebox.Type.String({ default: "remote-server", minLength: 10 }),
    host: typebox.Type.String({ default: "localhost" })
  },
  {
    $id: "RemoteServerConfigsSchema"
  }
);
class RemoteServerConfigNode extends ConfigNode {
  static validations = {
    configs: ConfigsSchema
  };
  // NOTE: run only once when node type is registered
  static async init() {
    console.log("testing remote-server node init");
    try {
      const response = await fetch("https://dog.ceo/api/breeds/image/random");
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      console.log(json);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error while fetching dogs: ", error.message);
      } else {
        console.error("Unknown error occurred: ", error);
      }
    }
  }
}
function getCredentialsFromSchema(schema) {
  const result = {};
  for (const [key, value] of Object.entries(schema.properties)) {
    const property = value;
    console.log(property);
    const isPassword = property.format === "password";
    result[key] = {
      // NOTE: required is defined by the JSON Schema
      required: false,
      type: isPassword ? "password" : "text",
      value: property.default ?? void 0
    };
  }
  return result;
}
async function registerType(RED, type, NodeClass) {
  if (!(NodeClass.prototype instanceof Node)) {
    throw new Error(
      `${NodeClass.name} must extend IONode or ConfigNode classes`
    );
  }
  if (!type) {
    throw new Error(`type must be provided when registering the node`);
  }
  if (Node.RED === void 0) {
    Object.defineProperty(Node, "RED", {
      value: RED,
      writable: false,
      configurable: false,
      enumerable: false
    });
  }
  if (IONode.RED === void 0) {
    Object.defineProperty(IONode, "RED", {
      value: RED,
      writable: false,
      configurable: false,
      enumerable: false
    });
  }
  if (ConfigNode.RED === void 0) {
    Object.defineProperty(ConfigNode, "RED", {
      value: RED,
      writable: false,
      configurable: false,
      enumerable: false
    });
  }
  if (NodeClass.RED === void 0) {
    Object.defineProperty(NodeClass, "RED", {
      value: RED,
      writable: false,
      configurable: false,
      enumerable: false
    });
  }
  if (NodeClass.type === void 0) {
    Object.defineProperty(NodeClass, "type", {
      value: type,
      writable: false,
      configurable: false,
      enumerable: false
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
  RED.nodes.registerType(type, NodeClass, {
    credentials: NodeClass.validations.credentials ? getCredentialsFromSchema(NodeClass.validations.credentials) : {}
  });
  RED.httpAdmin.get(`/nrg/nodes/${type}`, (req, res) => {
    if (NodeClass.validations) {
      const validationConfig = NodeClass.validations;
      const configsProperties = validationConfig.configs.properties ? validationConfig.configs.properties : {};
      const credentialsProperties = validationConfig.credentials?.properties ? validationConfig.credentials.properties : {};
      const nodeProperties = {
        schema: typebox.Type.Object({
          ...configsProperties,
          credentials: typebox.Type.Object({
            ...credentialsProperties
          })
        })
      };
      res.json(nodeProperties);
    } else {
      res.json({
        message: "Node was not configured with schemas to validate configs and credentials"
      });
    }
  });
}
async function index(RED) {
  try {
    console.log("Registering node types in series");
    await registerType(RED, "remote-server", RemoteServerConfigNode);
    await registerType(RED, "your-node", YourNode);
    console.log("All node types registered in series");
  } catch (error) {
    console.error("Error registering node types:", error);
  }
}
exports.RemoteServerConfigNode = RemoteServerConfigNode;
exports.YourNode = YourNode;
exports.default = index;
//# sourceMappingURL=index.js.map
