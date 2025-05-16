import { Type } from "@sinclair/typebox";

export default Type.Object({
  payload: Type.Optional(Type.String()),
  topic: Type.Optional(Type.String()),
  _msgid: Type.Optional(Type.String()),
});
