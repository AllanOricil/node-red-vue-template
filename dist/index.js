"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);

// src/core/validator-service.ts
var import_ajv = __toESM(require("ajv"));
var import_ajv_formats = __toESM(require("ajv-formats"));
var import_ajv_errors = __toESM(require("ajv-errors"));
var ValidatorService = class {
  static {
    __name(this, "ValidatorService");
  }
  ajv;
  constructor(options) {
    this.ajv = new import_ajv.default({
      allErrors: true,
      useDefaults: "empty",
      verbose: true,
      validateFormats: true,
      strict: true,
      coerceTypes: true,
      ...options
    });
    console.log(this.ajv.schemas);
    (0, import_ajv_formats.default)(this.ajv);
    (0, import_ajv_errors.default)(this.ajv);
    this.ajv.addKeyword("nodeType");
  }
  createValidator(schema) {
    return this.ajv.compile(schema);
  }
  errors(errors, options) {
    return this.ajv.errorsText(errors, options);
  }
};

// src/core/server/validator.ts
var validatorService = new ValidatorService();

// src/core/server/nodes/node.ts
var Node = class _Node {
  static {
    __name(this, "Node");
  }
  static RED;
  static type;
  static validations;
  id;
  type;
  name;
  z;
  g;
  configs;
  credentials;
  constructor(configs) {
    _Node.RED.nodes.createNode(this, configs);
    this.configs = configs;
    this.id = configs.id;
    this.type = configs.type;
    this.name = configs.name;
    this.z = configs.z;
    this.g = configs.g;
    if (_Node.validations?.configs) {
      console.log("validating configs");
      console.log(this.configs);
      console.log(this);
      const validator = validatorService.createValidator(
        _Node.validations?.configs
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
    if (_Node.validations?.credentials) {
      console.log("validating credentials");
      const validator = validatorService.createValidator(
        _Node.validations?.credentials
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
};

// src/core/server/nodes/io-node.ts
var IONode = class _IONode extends Node {
  static {
    __name(this, "IONode");
  }
  static validations;
  wires;
  x;
  y;
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
            const inputSchema = _IONode.validations?.input;
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
};

// src/core/server/nodes/config-node.ts
var ConfigNode = class extends Node {
  static {
    __name(this, "ConfigNode");
  }
  static validations;
  users;
  constructor(configs) {
    super(configs);
    this.users = configs._users || [];
  }
};

// src/nodes/your-node/schemas.ts
var import_typebox6 = require("@sinclair/typebox");

// src/core/schemas/config-node-configs.ts
var import_typebox2 = require("@sinclair/typebox");

// src/core/schemas/node-configs.ts
var import_typebox = require("@sinclair/typebox");
var node_configs_default = import_typebox.Type.Object({
  id: import_typebox.Type.String(),
  type: import_typebox.Type.String(),
  name: import_typebox.Type.String(),
  g: import_typebox.Type.Optional(import_typebox.Type.String()),
  z: import_typebox.Type.Optional(import_typebox.Type.String())
});

// src/core/schemas/config-node-configs.ts
var config_node_configs_default = import_typebox2.Type.Object({
  ...node_configs_default.properties,
  _users: import_typebox2.Type.Array(import_typebox2.Type.String())
});

// src/core/schemas/message.ts
var import_typebox3 = require("@sinclair/typebox");
var message_default = import_typebox3.Type.Object({
  payload: import_typebox3.Type.Optional(import_typebox3.Type.String()),
  topic: import_typebox3.Type.Optional(import_typebox3.Type.String()),
  _msgid: import_typebox3.Type.Optional(import_typebox3.Type.String())
});

// src/core/schemas/io-node-configs.ts
var import_typebox4 = require("@sinclair/typebox");
var io_node_configs_default = import_typebox4.Type.Object({
  ...node_configs_default.properties,
  wires: import_typebox4.Type.Array(import_typebox4.Type.Array(import_typebox4.Type.String(), { default: [] }), {
    default: [[]]
  }),
  x: import_typebox4.Type.Number(),
  y: import_typebox4.Type.Number()
});

// src/core/schemas/typed-input.ts
var import_typebox5 = require("@sinclair/typebox");

// src/core/constants.ts
var TYPED_INPUT_TYPES = [
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

// src/core/schemas/typed-input.ts
var TypedInputTypeLiterals = TYPED_INPUT_TYPES.map(
  (type) => import_typebox5.Type.Literal(type)
);
var typed_input_default = import_typebox5.Type.Object(
  {
    value: import_typebox5.Type.Union(
      [import_typebox5.Type.String(), import_typebox5.Type.Number(), import_typebox5.Type.Boolean(), import_typebox5.Type.Null()],
      {
        description: "The actual value entered or selected.",
        default: ""
      }
    ),
    type: import_typebox5.Type.Union(TypedInputTypeLiterals, {
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

// src/nodes/your-node/schemas.ts
var ConfigsSchema = import_typebox6.Type.Object(
  {
    ...io_node_configs_default.properties,
    name: import_typebox6.Type.String({ default: "your-node" }),
    myProperty: typed_input_default,
    myProperty2: typed_input_default,
    remoteServer: import_typebox6.Type.String({ nodeType: "remote-server" }),
    anotherRemoteServer: import_typebox6.Type.Optional(
      import_typebox6.Type.String({ nodeType: "remote-server" })
    ),
    country: import_typebox6.Type.String({ default: "brazil" }),
    fruit: import_typebox6.Type.Array(import_typebox6.Type.String(), { default: ["apple", "melon"] }),
    number: import_typebox6.Type.String({ default: "1" }),
    object: import_typebox6.Type.Array(import_typebox6.Type.String(), {
      default: [JSON.stringify({ test: "a" }), JSON.stringify({ test: "b" })]
    }),
    array: import_typebox6.Type.String({
      default: '["a"]'
    }),
    jsontest: import_typebox6.Type.String({ default: "" }),
    csstest: import_typebox6.Type.String({ default: "" })
  },
  {
    $id: "YourNodeConfigsSchema"
  }
);
var CredentialsSchema = import_typebox6.Type.Object(
  {
    password: import_typebox6.Type.Optional(
      import_typebox6.Type.String({
        default: "",
        minLength: 8,
        maxLength: 20,
        pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.source,
        format: "password"
      })
    ),
    password2: import_typebox6.Type.Optional(
      import_typebox6.Type.String({
        default: "",
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.source,
        format: "password"
      })
    ),
    username: import_typebox6.Type.Optional(
      import_typebox6.Type.String({ default: "", maxLength: 10, minLength: 5 })
    )
  },
  {
    $id: "YourNodeCredentialsSchema"
  }
);
var InputMessageSchema = import_typebox6.Type.Intersect(
  [
    message_default,
    import_typebox6.Type.Object({
      myVariable: import_typebox6.Type.Optional(import_typebox6.Type.String())
    })
  ],
  {
    $id: "YourNodeInputMessageSchema"
  }
);
var OutputMessageSchema = import_typebox6.Type.Intersect(
  [
    message_default,
    import_typebox6.Type.Object({
      originalType: import_typebox6.Type.Union([
        import_typebox6.Type.Literal("string"),
        import_typebox6.Type.Literal("number")
      ]),
      processedTime: import_typebox6.Type.Number()
    }),
    import_typebox6.Type.Unknown()
  ],
  { $id: "YourNodeOutputMessageSchema" }
);

// src/nodes/your-node/server/index.ts
var YourNode = class extends IONode {
  static {
    __name(this, "YourNode");
  }
  static validations = {
    configs: ConfigsSchema,
    credentials: CredentialsSchema,
    input: InputMessageSchema,
    outputs: OutputMessageSchema
  };
  static async init() {
    console.log("testing your node init");
  }
  async onInput(msg, send, done) {
    console.log(this);
    console.log(msg);
    const server = IONode.getNode(
      this.configs.remoteServer
    );
    console.log(server?.users);
  }
  async onClose(removed, done) {
    console.log("removing node");
    done();
  }
};

// src/nodes/remote-server/schemas.ts
var import_typebox7 = require("@sinclair/typebox");
var ConfigsSchema2 = import_typebox7.Type.Object(
  {
    ...config_node_configs_default.properties,
    name: import_typebox7.Type.String({ default: "remote-server", minLength: 10 }),
    host: import_typebox7.Type.String({ default: "localhost" })
  },
  {
    $id: "RemoteServerConfigsSchema"
  }
);

// src/nodes/remote-server/server/index.ts
var RemoteServerConfigNode = class extends ConfigNode {
  static {
    __name(this, "RemoteServerConfigNode");
  }
  static validations = {
    configs: ConfigsSchema2
  };
  // NOTE: run only once when node type is registered
  static init() {
    console.log("server-node");
  }
};

// src/core/server/index.ts
var import_typebox8 = require("@sinclair/typebox");

// src/core/utils.ts
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
__name(getCredentialsFromSchema, "getCredentialsFromSchema");

// src/core/server/index.ts
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
        schema: import_typebox8.Type.Object({
          ...configsProperties,
          credentials: import_typebox8.Type.Object({
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
__name(registerType, "registerType");

// src/index.server.ts
async function index_server_default(RED) {
  try {
    await registerType(RED, "remote-server", RemoteServerConfigNode);
    await registerType(RED, "your-node", YourNode);
    console.log("All node types registered in series");
  } catch (error) {
    console.error("Error registering node types:", error);
  }
}
__name(index_server_default, "default");

// src/server.ts
async function server_default(RED) {
  try {
    console.log("Running provided init");
    await index_server_default(RED);
    console.log("Finished running provided init");
  } catch (error) {
    console.error("Error while running provided init:", error);
  }
}
__name(server_default, "default");
//# sourceMappingURL=index.js.map
