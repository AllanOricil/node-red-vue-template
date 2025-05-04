import { registerType } from "../core/client";
import ServerNodeForm from "./ServerNodeForm.vue";
import YourNodeForm from "./YourNodeForm.vue";

// NOTE: provided by the User
const yourNodeFormSchema = {
  type: "object",
  properties: {
    credentials: {
      type: "object",
      properties: {
        username: {
          type: "string",
          minLength: 5,
          maxLength: 10,
          default: "",
        },
        // password: {
        //   type: "string",
        //   minLength: 8,
        //   maxLength: 20,
        //   pattern: "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]+$",
        //   default: "",
        // },
      },
      default: {},
      // required: ["password", "username"],
    },
    myProperty: {
      type: "object",
      properties: {
        value: {
          type: "string",
          default: "",
        },
        type: {
          type: "string",
          enum: [
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
            "cred",
          ],
          default: "str",
        },
      },
      required: ["value", "type"],
      default: {},
      oneOf: [
        {
          properties: {
            type: { const: "str" },
            value: { type: "string", minLength: 10 },
          },
        },
      ],
    },
    myProperty2: {
      type: "object",
      properties: {
        value: {
          type: "string",
          default: "",
        },
        type: {
          type: "string",
          enum: [
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
            "cred",
          ],
          default: "str",
        },
      },
      required: ["value", "type"],
      default: {},
    },
    country: {
      type: "string",
      default: "brasil",
    },
  },
};

// NOTE: provided by the User
const serverNodeSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      default: "server-node",
    },
    host: {
      type: "string",
      default: "",
    },
  },
};

registerType({
  type: "remote-server",
  category: "config",
  color: "#a6bbcf",
  form: ServerNodeForm,
  schema: serverNodeSchema,
});

registerType({
  type: "your-node",
  category: "function",
  color: "#FFFFFF",
  inputs: 1,
  outputs: 1,
  icon: "vue.png",
  form: YourNodeForm,
  schema: yourNodeFormSchema,
});
