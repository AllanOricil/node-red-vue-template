import { JSONSchema7 } from "json-schema";
import TypedInputSchema from "./typed-input-schema";

const InputsSchema: JSONSchema7 = {
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 10,
    },
  },
  required: ["name"],
};

export default InputsSchema;
