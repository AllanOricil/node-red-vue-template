import { Type } from "@sinclair/typebox";
import NodeConfigsSchema from "./node-configs";

export default Type.Object({
  ...NodeConfigsSchema.properties,
  _users: Type.Array(Type.String(), { default: [] }),
});
