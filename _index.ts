import { Config, Secret, Editor, isTypedInput } from "./decorators";

// type Config<T = any> = {
//   value: T;
//   type?: string;
//   required?: boolean;
//   validate?: (value: T) => boolean;
// };

// type TypedInput = {
//   value?: Config;
//   type: Config;
// };

// function isTypedInput(value: any): value is TypedInput {
//   return (
//     value && typeof value === "object" && "value" in value && "type" in value
//   );
// }

// function defineNodeConfig<T extends NodeRedConfig>(config: T): T {
//   const result = { ...config };

//   for (const key in result) {
//     const prop = result[key];

//     if (isTypedInput(prop)) {
//       if (prop.value.value === undefined) {
//         prop.value.value = "";
//       }
//       if (prop.type.value === undefined) {
//         prop.type.value = "msg";
//       }
//     }
//   }

//   return result;
// }

// interface Test {
//   name: Config;
//   delay: Config;
//   payload: TypedInput;
// }

class Node {
  constructor(RED: any, config: any) {
    RED.nodes.createNode(this, config);

    if (this.constructor.configProperties) {
      this.constructor.configProperties.forEach(
        ({ key, default: defaultValue }) => {
          this[key] = config[key] !== undefined ? config[key] : defaultValue;
        }
      );
    }

    this.validateConfig();
  }

  validateConfig() {
    for (const { key, required, validate, type } of this.constructor
      .configProperties || []) {
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

  async evaluateProperty(value, type, msg) {
    return new Promise((resolve, reject) => {
      RED.util.evaluateNodeProperty(value, type, this, msg, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
}

export default function (RED: any) {
  @Editor({
    category: "function",
    color: "#000000",
    inputs: 1,
    outputs: 1,
    icon: "node.svg",
  })
  class YourNode extends Node {
    @Config({
      value: "abc",
      type: "str",
      required: true,
      validate: function (value) {
        return value.length > 3 ? true : "Must be at least 4 characters";
      },
    })
    myProperty;

    @Config({ type: "remote-server", required: true })
    remoteServer;

    @Config({ value: "brasil", required: true })
    country;

    @Config({ value: "appple", required: true })
    fruit;

    @Config({ value: JSON.stringify({ a: "abc" }), required: true })
    jsontest;

    @Config({
      value: `.docs {
    background: #FFFFFF
  }`,
      required: true,
    })
    csstest;

    @Secret({ type: "text", required: true })
    username;

    @Secret({ type: "password" })
    password;

    constructor(config) {
      super(RED, config);

      console.log(config);
      // this.myProperty = config.myProperty;
      // this.myPropertyType = config.myPropertyType;
      // this.server = RED.nodes.getNode(config.server);

      // console.log("SERVER: ", this.server);

      // this.on("input", async (msg, send, done) => {
      //   try {
      //     const value = await this.evaluateProperty(
      //       this.myProperty,
      //       this.myPropertyType,
      //       msg
      //     );
      //     msg.payload = value;
      //     send(msg);
      //     if (done) done();
      //   } catch (error) {
      //     this.error(`Failed to evaluate property: ${error.message}`, msg);
      //     if (done) done(error);
      //   }
      // });
    }
  }

  RED.nodes.registerType("your-node", YourNode, {
    credentials: YourNode.secrets.reduce((acc, { key, type, required }) => {
      acc[key] = {
        type,
        required,
      };
      return acc;
    }, {}),
  });

  RED.httpAdmin.get("/your-node", function (req, res) {
    let editorConfig = { ...YourNode.editorConfig } || {};
    editorConfig.defaults = {};

    if (Array.isArray(YourNode.configProperties)) {
      YourNode.configProperties.forEach(
        ({ key, value, type, validate, required }) => {
          editorConfig.defaults[key] = {
            value,
            type,
            validate,
            required,
          };
        }
      );
    }

    // editorConfig.defaults.myProperty = {
    //   value: {
    //     type: "object",
    //     properties: {
    //       myProperty: {
    //         type: "string",
    //         default: "defaultVal",
    //         required: true,
    //         validate: (val: string) =>
    //           val.length > 3 ? true : "Must be at least 4 characters",
    //       },
    //       myPropertyType: {
    //         type: "string",
    //         default: "msg",
    //         enum: ["msg", "flow", "global"],
    //       },
    //       remoteServer: { type: "string", default: "" },
    //       configNode: { type: "string", default: "" },
    //     },
    //     required: ["myProperty"],
    //   },
    // };

    editorConfig.credentials = YourNode.secrets.reduce(
      (acc, { key, type, required }) => {
        acc[key] = {
          type,
          required,
        };
        return acc;
      },
      {}
    );

    res.json(editorConfig);
  });
}
