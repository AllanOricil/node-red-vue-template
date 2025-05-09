import { Type } from "@sinclair/typebox";

const ConfigsSchema = Type.Object(
  {
    name: Type.String({ default: "remote-server", minLength: 10 }),
    host: Type.String({ default: "localhost" }),
  },
  {
    $id: "RemoteServerConfigsSchema",
  }
);

export { ConfigsSchema };
