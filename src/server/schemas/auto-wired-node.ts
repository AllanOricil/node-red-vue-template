import { SchemaType, defineSchema } from "@bonsae/nrg/server";
import RemoteServerConfigNode from "../nodes/remote-server";

const ConfigsSchema = defineSchema(
  {
    name: SchemaType.String({
      default: "auto-wired-node",
      "x-nrg-form": { icon: "tag" },
    }),
    url: SchemaType.String({
      description: 'Target API endpoint URL',
      default: "https://api.example.com",
      "x-nrg-form": { icon: "globe" },
    }),
    method: SchemaType.String({
      description: 'HTTP method for the request',
      default: "GET",
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      "x-nrg-form": { icon: "random" },
    }),
    timeout: SchemaType.Number({
      description: 'Request timeout in milliseconds',
      default: 5000,
      "x-nrg-form": { icon: "clock-o" },
    }),
    retries: SchemaType.Number({
      description: 'Number of retry attempts on failure',
      default: 0,
      "x-nrg-form": { icon: "repeat" },
    }),
    followRedirects: SchemaType.Boolean({
      description: 'Automatically follow HTTP redirects',
      default: true,
      "x-nrg-form": { icon: "share", toggle: true },
    }),
    verbose: SchemaType.Boolean({
      description: 'Enable detailed logging',
      default: false,
      "x-nrg-form": { icon: "bug" },
    }),
    tags: SchemaType.Array(
      SchemaType.String({ enum: ["api", "production", "staging", "v1", "v2"] }),
      { description: 'Tags for categorizing the node', default: [] },
    ),
    server: SchemaType.NodeRef(RemoteServerConfigNode, {
      description: 'Remote server configuration',
      "x-nrg-form": { icon: "server" },
    }),
    endpoint: SchemaType.TypedInput({ description: 'API endpoint path or expression', "x-nrg-form": { icon: "plug" } }),
    payload: SchemaType.TypedInput({
      description: 'Request body content',
      "x-nrg-form": {
        icon: "envelope",
        typedInputTypes: ["str", "num", "msg", "json"],
      },
    }),
  },
  {
    $id: "AutoWiredNodeConfigsSchema",
  },
);

console.log(ConfigsSchema);

const CredentialsSchema = defineSchema(
  {
    apiKey: SchemaType.Optional(
      SchemaType.String({
        description: 'API key for authentication',
        default: "",
        format: "password",
        minLength: 8,
        "x-nrg-form": { icon: "key" },
      }),
    ),
    username: SchemaType.Optional(
      SchemaType.String({
        description: 'Username for authentication',
        default: "",
        minLength: 3,
        "x-nrg-form": { icon: "user" },
      }),
    ),
  },
  {
    $id: "AutoWiredNodeCredentialsSchema",
  },
);

const InputSchema = defineSchema(
  {
    payload: SchemaType.Optional(SchemaType.String({ description: 'Incoming message payload' })),
  },
  {
    $id: "AutoWiredNodeInputSchema",
  },
);

const OutputSchema = defineSchema(
  {
    statusCode: SchemaType.Number({ description: 'HTTP response status code' }),
    body: SchemaType.String({ description: 'Response body as JSON string' }),
  },
  {
    $id: "AutoWiredNodeOutputSchema",
  },
);

export { ConfigsSchema, CredentialsSchema, InputSchema, OutputSchema };
