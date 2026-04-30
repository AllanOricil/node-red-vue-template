import { SchemaType, defineSchema } from "@bonsae/nrg/server";
import RemoteServerConfigNode from "../nodes/remote-server";

const ConfigsSchema = defineSchema(
  {
    name: SchemaType.String({
      default: "auto-wired-node",
      "x-nrg-form": { icon: "tag" },
    }),
    url: SchemaType.String({
      default: "https://api.example.com",
      "x-nrg-form": { icon: "globe" },
    }),
    method: SchemaType.String({
      default: "GET",
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      "x-nrg-form": { icon: "random" },
    }),
    timeout: SchemaType.Number({
      default: 5000,
      "x-nrg-form": { icon: "clock-o" },
    }),
    retries: SchemaType.Number({
      default: 0,
      "x-nrg-form": { icon: "repeat" },
    }),
    followRedirects: SchemaType.Boolean({
      default: true,
      "x-nrg-form": { icon: "share", toggle: true },
    }),
    verbose: SchemaType.Boolean({
      default: false,
      "x-nrg-form": { icon: "bug" },
    }),
    tags: SchemaType.Array(
      SchemaType.String({ enum: ["api", "production", "staging", "v1", "v2"] }),
      { default: [] },
    ),
    server: SchemaType.NodeRef(RemoteServerConfigNode, {
      "x-nrg-form": { icon: "server" },
    }),
    endpoint: SchemaType.TypedInput({ "x-nrg-form": { icon: "plug" } }),
    payload: SchemaType.TypedInput({
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
        default: "",
        format: "password",
        minLength: 8,
        "x-nrg-form": { icon: "key" },
      }),
    ),
    username: SchemaType.Optional(
      SchemaType.String({
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
