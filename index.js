"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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

// src/core/server/decorators.ts
var decorators_exports = {};
__export(decorators_exports, {
  node: () => node
});
function node(options) {
  return function(constructor) {
    return class extends constructor {
      static __nodeProperties___ = options;
    };
  };
}
var init_decorators = __esm({
  "src/core/server/decorators.ts"() {
    "use strict";
    __name(node, "node");
  }
});

// src/core/server/node.ts
var node_exports = {};
__export(node_exports, {
  Node: () => Node
});
var Node;
var init_node = __esm({
  "src/core/server/node.ts"() {
    "use strict";
    Node = class _Node {
      static {
        __name(this, "Node");
      }
      static RED;
      id;
      type;
      name;
      wires;
      x;
      y;
      z;
      g;
      configs;
      credentials;
      constructor(configs) {
        _Node.RED.nodes.createNode(this, configs);
        this.configs = configs;
        this.x = configs.x;
        this.y = configs.y;
        this.z = configs.z;
        this.g = configs.g;
      }
      static init() {
        console.log("not implemented");
      }
      static getNode(id) {
        return this.RED.nodes.getNode(id);
      }
    };
  }
});

// src/core/schemas/message.ts
var import_typebox, message_default;
var init_message = __esm({
  "src/core/schemas/message.ts"() {
    "use strict";
    import_typebox = require("@sinclair/typebox");
    message_default = import_typebox.Type.Object({
      payload: import_typebox.Type.Optional(import_typebox.Type.String()),
      topic: import_typebox.Type.Optional(import_typebox.Type.String()),
      _msgid: import_typebox.Type.Optional(import_typebox.Type.String())
    });
  }
});

// src/core/constants.ts
var TYPED_INPUT_TYPES;
var init_constants = __esm({
  "src/core/constants.ts"() {
    "use strict";
    TYPED_INPUT_TYPES = [
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
  }
});

// src/core/schemas/typed-input.ts
var import_typebox2, TypedInputTypeLiterals, typed_input_default;
var init_typed_input = __esm({
  "src/core/schemas/typed-input.ts"() {
    "use strict";
    import_typebox2 = require("@sinclair/typebox");
    init_constants();
    TypedInputTypeLiterals = TYPED_INPUT_TYPES.map(
      (type) => import_typebox2.Type.Literal(type)
    );
    typed_input_default = import_typebox2.Type.Object(
      {
        value: import_typebox2.Type.Union(
          [import_typebox2.Type.String(), import_typebox2.Type.Number(), import_typebox2.Type.Boolean(), import_typebox2.Type.Null()],
          {
            description: "The actual value entered or selected.",
            default: ""
          }
        ),
        type: import_typebox2.Type.Union(TypedInputTypeLiterals, {
          description: "The type of the value (string, number, message property, etc.)",
          default: "str"
        })
      },
      {
        description: "Represents a Node-RED TypedInput value and its type.",
        default: {}
      }
    );
  }
});

// src/nodes/your-node/schemas.ts
var schemas_exports = {};
__export(schemas_exports, {
  ConfigsSchema: () => ConfigsSchema,
  CredentialsSchema: () => CredentialsSchema,
  InputMessageSchema: () => InputMessageSchema,
  OutputMessageSchema: () => OutputMessageSchema
});
var import_typebox3, ConfigsSchema, CredentialsSchema, InputMessageSchema, OutputMessageSchema;
var init_schemas = __esm({
  "src/nodes/your-node/schemas.ts"() {
    "use strict";
    import_typebox3 = require("@sinclair/typebox");
    init_message();
    init_typed_input();
    ConfigsSchema = import_typebox3.Type.Object(
      {
        name: import_typebox3.Type.String({ default: "your-node" }),
        myProperty: typed_input_default,
        myProperty2: typed_input_default,
        remoteServer: import_typebox3.Type.String({ nodeType: "remote-server" }),
        anotherRemoteServer: import_typebox3.Type.Optional(
          import_typebox3.Type.String({ nodeType: "remote-server" })
        ),
        country: import_typebox3.Type.String({ default: "brazil" }),
        fruit: import_typebox3.Type.Array(import_typebox3.Type.String(), { default: ["apple", "melon"] }),
        number: import_typebox3.Type.String({ default: "1" }),
        object: import_typebox3.Type.Array(import_typebox3.Type.String(), {
          default: [JSON.stringify({ test: "a" }), JSON.stringify({ test: "b" })]
        }),
        array: import_typebox3.Type.String({
          default: '["a"]'
        }),
        jsontest: import_typebox3.Type.String({ default: "" }),
        csstest: import_typebox3.Type.String({ default: "" })
      },
      {
        $id: "YourNodeConfigsSchema"
      }
    );
    CredentialsSchema = import_typebox3.Type.Object(
      {
        password: import_typebox3.Type.Optional(
          import_typebox3.Type.String({
            default: "",
            minLength: 8,
            maxLength: 20,
            pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.source,
            format: "password"
          })
        ),
        password2: import_typebox3.Type.Optional(
          import_typebox3.Type.String({
            default: "",
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.source,
            format: "password"
          })
        ),
        username: import_typebox3.Type.Optional(
          import_typebox3.Type.String({ default: "", maxLength: 10, minLength: 5 })
        )
      },
      {
        $id: "YourNodeCredentialsSchema"
      }
    );
    InputMessageSchema = import_typebox3.Type.Intersect(
      [
        message_default,
        import_typebox3.Type.Object({
          myVariable: import_typebox3.Type.Optional(import_typebox3.Type.String())
        })
      ],
      {
        $id: "YourNodeInputMessageSchema"
      }
    );
    OutputMessageSchema = import_typebox3.Type.Intersect(
      [
        message_default,
        import_typebox3.Type.Object({
          originalType: import_typebox3.Type.Union([
            import_typebox3.Type.Literal("string"),
            import_typebox3.Type.Literal("number")
          ]),
          processedTime: import_typebox3.Type.Number()
        }),
        import_typebox3.Type.Unknown()
      ],
      { $id: "YourNodeOutputMessageSchema" }
    );
  }
});

// src/nodes/your-node/server/index.ts
var require_server = __commonJS({
  "src/nodes/your-node/server/index.ts"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var decorators_1 = (init_decorators(), __toCommonJS(decorators_exports));
    var node_1 = (init_node(), __toCommonJS(node_exports));
    var schemas_1 = (init_schemas(), __toCommonJS(schemas_exports));
    var YourNode2 = class YourNode extends node_1.Node {
      static {
        __name(this, "YourNode");
      }
      static async init() {
        console.log("testing your node init");
      }
      async onInput(msg, send, done) {
        console.log(this);
        console.log(msg);
        const server = node_1.Node.getNode(this.configs.remoteServer);
        console.log(server?.users);
      }
      async onClose(removed, done) {
        console.log("removing node");
        done();
      }
    };
    YourNode2 = __decorate([
      (0, decorators_1.node)({
        validation: {
          configs: schemas_1.ConfigsSchema,
          credentials: schemas_1.CredentialsSchema,
          input: schemas_1.InputMessageSchema,
          outputs: schemas_1.OutputMessageSchema
        }
      })
    ], YourNode2);
    exports2.default = YourNode2;
  }
});

// src/core/server/config-node.ts
var config_node_exports = {};
__export(config_node_exports, {
  ConfigNode: () => ConfigNode
});
var ConfigNode;
var init_config_node = __esm({
  "src/core/server/config-node.ts"() {
    "use strict";
    ConfigNode = class _ConfigNode {
      static {
        __name(this, "ConfigNode");
      }
      static RED;
      id;
      type;
      name;
      users;
      configs;
      credentials;
      constructor(configs) {
        _ConfigNode.RED.nodes.createNode(this, configs);
        this.configs = configs;
        this.users = configs._users;
        this.z = configs.z;
        this.g = configs.g;
      }
      static init() {
        console.log("not implemented");
      }
      static getNode(id) {
        return this.RED.nodes.getNode(id);
      }
    };
  }
});

// src/nodes/remote-server/schemas.ts
var schemas_exports2 = {};
__export(schemas_exports2, {
  ConfigsSchema: () => ConfigsSchema2
});
var import_typebox4, ConfigsSchema2;
var init_schemas2 = __esm({
  "src/nodes/remote-server/schemas.ts"() {
    "use strict";
    import_typebox4 = require("@sinclair/typebox");
    ConfigsSchema2 = import_typebox4.Type.Object(
      {
        name: import_typebox4.Type.String({ default: "remote-server", minLength: 10 }),
        host: import_typebox4.Type.String({ default: "localhost" })
      },
      {
        $id: "RemoteServerConfigsSchema"
      }
    );
  }
});

// src/nodes/remote-server/server/index.ts
var require_server2 = __commonJS({
  "src/nodes/remote-server/server/index.ts"(exports2) {
    "use strict";
    var __decorate = exports2 && exports2.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var decorators_1 = (init_decorators(), __toCommonJS(decorators_exports));
    var config_node_1 = (init_config_node(), __toCommonJS(config_node_exports));
    var schemas_1 = (init_schemas2(), __toCommonJS(schemas_exports2));
    var RemoteServerConfigNode2 = class RemoteServerConfigNode extends config_node_1.ConfigNode {
      static {
        __name(this, "RemoteServerConfigNode");
      }
      // NOTE: run only once when node type is registered
      static init() {
        console.log("server-node");
      }
    };
    RemoteServerConfigNode2 = __decorate([
      (0, decorators_1.node)({
        validation: {
          configs: schemas_1.ConfigsSchema
        }
      })
    ], RemoteServerConfigNode2);
    exports2.default = RemoteServerConfigNode2;
  }
});

// src/server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);

// src/index.server.ts
var import_server = __toESM(require_server());
var import_server2 = __toESM(require_server2());

// src/core/server/index.ts
init_node();
init_config_node();

// src/core/utils.ts
function getDefaultsFromSchema(schema) {
  const result = {};
  const properties = schema.properties || {};
  const requiredProps = Array.isArray(schema.required) ? schema.required : [];
  console.log("getDefaultsFromSchema");
  for (const [key, value] of Object.entries(properties)) {
    console.log(key);
    console.log(value);
    result[key] = {
      required: requiredProps.includes(key),
      value: value.default ?? ""
    };
    if ("nodeType" in value) {
      result[key].type = value.nodeType;
    }
  }
  return result;
}
__name(getDefaultsFromSchema, "getDefaultsFromSchema");
function getCredentialsFromSchema(schema) {
  const result = {};
  const properties = schema.properties || {};
  const requiredProps = Array.isArray(schema.required) ? schema.required : [];
  for (const [key, value] of Object.entries(properties)) {
    console.log(value);
    if (Array.isArray(value)) {
    }
    const isPassword = value.format === "password";
    result[key] = {
      type: isPassword ? "password" : "text",
      required: requiredProps.includes(key),
      value: value.default ?? ""
    };
  }
  return result;
}
__name(getCredentialsFromSchema, "getCredentialsFromSchema");

// src/core/server/index.ts
var import_typebox5 = require("@sinclair/typebox");

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
  resetCache() {
    this.ajv.cache.clear();
  }
  errors(errors, options) {
    return this.ajv.errorsText(errors, options);
  }
};

// src/core/server/validator.ts
var validatorService = new ValidatorService();

// src/core/server/index.ts
async function registerType(RED, type, NodeClass) {
  if (!(NodeClass.prototype instanceof Node) && !(NodeClass.prototype instanceof ConfigNode)) {
    throw new Error(`${NodeClass.name} must extend Node | ConfigNode class`);
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
            dataVar: "- configs"
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
            dataVar: "- credentials"
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
    setupEventHandlers() {
      console.log("INSIDE SETUPTEVENTHANDLERS");
      if (this.onInput) {
        console.log("REGISTERING ON INPUT");
        this.on("input", async (msg, send, done) => {
          try {
            const inputSchema = NodeClass.__nodeProperties___.validation?.input;
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
  __name(defaults, "defaults");
  function credentials() {
    const schema = NodeClass.__nodeProperties___.validation?.credentials;
    return schema ? getCredentialsFromSchema(schema) : {};
  }
  __name(credentials, "credentials");
  RED.nodes.registerType(type, classRegistry["_NodeClass"], {
    credentials: credentials()
  });
  RED.httpAdmin.get(`/nrg/nodes/${type}`, function(req, res) {
    const nodeProperties = { ...classRegistry["_NodeClass"].__nodeProperties___ };
    nodeProperties.schema = import_typebox5.Type.Object({
      ...classRegistry["_NodeClass"].__nodeProperties___.validation.configs?.properties,
      credentials: import_typebox5.Type.Object({
        ...classRegistry["_NodeClass"].__nodeProperties___.validation.credentials?.properties
      })
    });
    res.json(nodeProperties);
  });
}
__name(registerType, "registerType");

// src/index.server.ts
async function index_server_default(RED) {
  try {
    await registerType(RED, "remote-server", import_server2.default);
    await registerType(RED, "your-node", import_server.default);
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
