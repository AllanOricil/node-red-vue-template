import { Type } from "@sinclair/typebox";
import { ConfigNodeConfigsSchema } from "../core/schemas";

const ConfigsSchema = Type.Object(
  {
    ...ConfigNodeConfigsSchema.properties,
    name: Type.String({ default: "remote-server", minLength: 10 }),
    host: Type.String({ default: "localhost" }),
  },
  {
    $id: "RemoteServerConfigsSchema",
  }
);

export { ConfigsSchema };
