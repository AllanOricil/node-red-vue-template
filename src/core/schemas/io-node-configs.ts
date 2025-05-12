import { Type } from "@sinclair/typebox";
import NodeConfigsSchema from "./node-configs";

export default Type.Object({
  ...NodeConfigsSchema.properties,
  wires: Type.Array(Type.Array(Type.String())),
  x: Type.Number(),
  y: Type.Number(),
});
