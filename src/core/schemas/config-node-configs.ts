import { Type } from "@sinclair/typebox";
import BaseNodeConfigsSchema from "./base-node-configs";

export default Type.Object({
  ...BaseNodeConfigsSchema.properties,
  _users: Type.Array(Type.String()),
});
