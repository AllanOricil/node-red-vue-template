import { JSONSchema7 } from "json-schema";
import TypedInputSchema from "./typed-input-schema";

const InputsSchema: JSONSchema7 = {
  type: "object",
  properties: {
    host: {
      type: "string",
    },
  },
  required: ["host"],
};

export default InputsSchema;
