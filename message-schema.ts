import { JSONSchema7 } from "json-schema";
import TypedInputSchema from "./typed-input-schema";

const MessageSchema: JSONSchema7 = {
  type: "object",
  properties: {
    payload: {
      type: "string",
      format: "date-time",
    },
  },
  required: ["payload"],
};

export default MessageSchema;
