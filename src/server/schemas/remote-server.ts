import { SchemaType, defineSchema } from "@bonsae/nrg/server";

const ConfigsSchema = defineSchema(
  {
    name: SchemaType.String({ default: "remote-server", minLength: 10 }),
    host: SchemaType.String({
      description: "Server hostname or IP address",
      default: "localhost",
    }),
  },
  {
    $id: "RemoteServerConfigsSchema",
  },
);

export { ConfigsSchema };
