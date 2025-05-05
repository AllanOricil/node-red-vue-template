export default {
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
      errorMessage: {
        properties: {
          username:
            "data.credentials.username should be string with length >=5 and length <= 10",
        },
      },
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
