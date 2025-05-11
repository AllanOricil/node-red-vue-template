import { Type } from "@sinclair/typebox";
import BaseNodeConfigsSchema from "./base-node-configs";

export default Type.Object({
  ...BaseNodeConfigsSchema.properties,
  wires: Type.Array(Type.Array(Type.String())),
  x: Type.Number(),
  y: Type.Number(),
});
