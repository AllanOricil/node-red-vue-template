import { Type } from "@sinclair/typebox";
import NodeConfigsSchema from "./node-configs";

export default Type.Object({
  ...NodeConfigsSchema.properties,
  wires: Type.Array(Type.Array(Type.String(), { default: [] }), {
    default: [[]],
  }),
  x: Type.Number(),
  y: Type.Number(),
  g: Type.Optional(Type.String()),
});
