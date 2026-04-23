import { SchemaType, defineSchema } from "@bonsae/nrg/server";

const ConfigsSchema = defineSchema(
  {
    name: SchemaType.String({ default: "remote-server", minLength: 10 }),
    host: SchemaType.String({ default: "localhost" }),
  },
  {
    $id: "RemoteServerConfigsSchema",
  },
);

export { ConfigsSchema };
