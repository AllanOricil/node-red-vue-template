import { Type } from "@sinclair/typebox";

const ConfigsSchema = Type.Object({
  name: Type.String({ default: "remote-server" }),
  host: Type.String({ default: "localhost" }),
});

export { ConfigsSchema };
