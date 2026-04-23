import { SchemaType, defineSchema } from "@bonsae/nrg/server";
import RemoteServerConfigNode from "../nodes/remote-server";

const ConfigsSchema = defineSchema(
  {
    name: SchemaType.String({ default: "auto-wired-node" }),
    url: SchemaType.String({ default: "https://api.example.com" }),
    method: SchemaType.String({
      default: "GET",
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    }),
    timeout: SchemaType.Number({ default: 5000 }),
    retries: SchemaType.Number({ default: 0 }),
    followRedirects: SchemaType.Boolean({ default: true }),
    tags: SchemaType.Array(
      SchemaType.String({ enum: ["api", "production", "staging", "v1", "v2"] }),
      { default: [] },
    ),
    server: SchemaType.NodeRef(RemoteServerConfigNode),
    endpoint: SchemaType.TypedInput(),
  },
  {
    $id: "AutoWiredNodeConfigsSchema",
  },
);

const CredentialsSchema = defineSchema(
  {
    apiKey: SchemaType.Optional(
      SchemaType.String({ default: "", format: "password", minLength: 8 }),
    ),
    username: SchemaType.Optional(
      SchemaType.String({ default: "", minLength: 3 }),
    ),
  },
  {
    $id: "AutoWiredNodeCredentialsSchema",
  },
);

const InputSchema = defineSchema(
  {
    payload: SchemaType.Optional(SchemaType.String()),
  },
  {
    $id: "AutoWiredNodeInputSchema",
  },
);

const OutputSchema = defineSchema(
  {
    statusCode: SchemaType.Number(),
    body: SchemaType.String(),
  },
  {
    $id: "AutoWiredNodeOutputSchema",
  },
);

export { ConfigsSchema, CredentialsSchema, InputSchema, OutputSchema };
