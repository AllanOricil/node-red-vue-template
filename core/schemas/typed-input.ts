import { Type, Static } from "@sinclair/typebox";
import { TYPED_INPUT_TYPES } from "../constants";

const TypedInputTypeLiterals = TYPED_INPUT_TYPES.map((type) =>
  Type.Literal(type)
);

export default Type.Object(
  {
    value: Type.Union(
      [Type.String(), Type.Number(), Type.Boolean(), Type.Null()],
      {
        description: "The actual value entered or selected.",
        default: "",
      }
    ),
    type: Type.Union(TypedInputTypeLiterals, {
      description:
        "The type of the value (string, number, message property, etc.)",
      default: "str",
    }),
  },
  {
    description: "Represents a Node-RED TypedInput value and its type.",
    default: {
      type: "str",
      value: "",
    },
  }
);
