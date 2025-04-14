import { JSONSchema7 } from "json-schema";
import TypedInputSchema from "./typed-input-schema";

const InputsSchema: JSONSchema7 = {
  type: "object",
  properties: {
    name: {
      type: "string",
    },
    myProperty: {
      ...TypedInputSchema,
    },
    remoteServer: {
      type: "string",
    },
    username: {
      type: "number",
    },
    password: {
      type: "string",
    },
    number: {
      type: "number",
    },
  },
  required: ["myProperty", "remoteServer", "username", "password", "number"],
};

export default InputsSchema;
