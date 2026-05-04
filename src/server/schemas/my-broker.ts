import { defineSchema, SchemaType } from "@bonsae/nrg/server";

const ConfigsSchema = defineSchema(
  {
    name: SchemaType.String({ default: "my-broker" }),
    host: SchemaType.String({
      description: "Broker hostname or IP address",
      default: "localhost",
    }),
    port: SchemaType.Number({
      description: "Broker port number",
      default: 1883,
    }),
    useTls: SchemaType.Boolean({
      description: "Use TLS/SSL for the connection",
      default: false,
    }),
  },
  { $id: "my-broker:configs" },
);

const CredentialsSchema = defineSchema(
  {
    username: SchemaType.Optional(
      SchemaType.String({ description: "Broker username", default: "" }),
    ),
    password: SchemaType.Optional(
      SchemaType.String({
        description: "Broker password",
        default: "",
        format: "password",
      }),
    ),
  },
  { $id: "my-broker:credentials" },
);

export { ConfigsSchema, CredentialsSchema };
