import { JSONSchema7 } from "json-schema";

const TypedInputSchema: JSONSchema7 = {
  type: "object",
  title: "Typed Input Value/Type Pair",
  description:
    "Represents a value and its associated type selected via a Node-RED TypedInput widget.",
  properties: {
    value: {
      type: "string",
      title: "Value",
      description: "The value entered or selected in the TypedInput.",
      default: "",
    },
    type: {
      type: "string",
      title: "Value Type",
      description: "The type selected in the TypedInput.",
      enum: [
        "msg",
        "flow",
        "global",
        "str",
        "num",
        "bool",
        "json",
        "env",
        "bin",
        "date",
        "jsonata",
      ],
      default: "msg",
    },
  },
  required: ["value", "type"],
};

export default TypedInputSchema;
