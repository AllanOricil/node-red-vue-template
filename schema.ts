export default {
  type: "object",
  properties: {
    name: {
      type: "string",
    },
    myProperty: {
      type: "object",
      properties: {
        value: {
          type: "string",
          default: "",
          minLength: 4,
        },
        type: {
          type: "string",
          default: "msg",
        },
      },
      required: ["value", "type"],
    },
    remoteServer: {
      type: "string",
    },
    username: {
      type: "string",
    },
    password: {
      type: "string",
    },
    required: ["myProperty", "remoteServer"],
  },
};
