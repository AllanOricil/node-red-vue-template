import { defineSchema, SchemaType } from "@bonsae/nrg/server";

const ConfigsSchema = defineSchema(
  {
    name: SchemaType.String({ default: "my-broker" }),
    host: SchemaType.String({ default: "localhost" }),
    port: SchemaType.Number({ default: 1883 }),
    useTls: SchemaType.Boolean({ default: false }),
  },
  { $id: "my-broker:configs" },
);

const CredentialsSchema = defineSchema(
  {
    username: SchemaType.Optional(SchemaType.String({ default: "" })),
    password: SchemaType.Optional(
      SchemaType.String({ default: "", format: "password" }),
    ),
  },
  { $id: "my-broker:credentials" },
);

export { ConfigsSchema, CredentialsSchema };
