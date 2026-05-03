import { SchemaType, defineSchema } from "@bonsae/nrg/server";
import RemoteServerConfigNode from "../nodes/remote-server";
import type YourNode from "../nodes/your-node";

const ConfigsSchema = defineSchema(
  {
    name: SchemaType.String({ default: "your-node" }),
    myProperty: SchemaType.TypedInput<YourNode>({
      description: 'Node reference resolved via TypedInput',
      "x-nrg-form": { typedInputTypes: ["node", "str"] },
    }),
    myProperty2: SchemaType.TypedInput({ description: 'Generic TypedInput value' }),
    remoteServer: SchemaType.NodeRef(RemoteServerConfigNode, { description: 'Primary remote server connection' }),
    anotherRemoteServer: SchemaType.NodeRef(RemoteServerConfigNode, { description: 'Secondary remote server connection' }),
    country: SchemaType.String({ description: 'Selected country', default: "brazil" }),
    fruit: SchemaType.Array(SchemaType.String(), {
      description: 'Selected fruits',
      default: ["apple", "melon"],
    }),
    number: SchemaType.String({ description: 'Numeric string value', default: "1" }),
    object: SchemaType.Array(SchemaType.String(), {
      description: 'Array of JSON object strings',
      default: [JSON.stringify({ test: "a" }), JSON.stringify({ test: "b" })],
    }),
    array: SchemaType.String({
      description: 'JSON array as string',
      default: '["a"]',
    }),
    jsontest: SchemaType.String({ description: 'JSON editor test field', default: "" }),
    csstest: SchemaType.String({ description: 'CSS editor test field', default: "" }),
  },
  {
    $id: "YourNodeConfigsSchema",
  },
);

const CredentialsSchema = defineSchema(
  {
    password: SchemaType.Optional(
      SchemaType.String({
        description: 'Primary password with alphanumeric pattern',
        default: "",
        minLength: 8,
        maxLength: 20,
        pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.source,
        format: "password",
      }),
    ),
    password2: SchemaType.Optional(
      SchemaType.String({
        description: 'Secondary password with complex pattern',
        default: "",
        pattern:
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            .source,
        format: "password",
      }),
    ),
    username: SchemaType.Optional(
      SchemaType.String({ description: 'Account username', default: "", maxLength: 10, minLength: 5 }),
    ),
  },
  {
    $id: "YourNodeCredentialsSchema",
  },
);

const InputSchema = defineSchema(
  {
    myVariable: SchemaType.Optional(SchemaType.String({ description: 'Optional input variable' })),
  },
  {
    $id: "YourNodeInputSchema",
  },
);

const OutputSchema = defineSchema(
  {
    originalType: SchemaType.Union([
      SchemaType.Literal("string"),
      SchemaType.Literal("number"),
    ], { description: 'Type of the original value' }),
    processedTime: SchemaType.Number({ description: 'Timestamp when the message was processed' }),
  },
  {
    $id: "YourNodeOutputSchema",
  },
);

const SettingsSchema = defineSchema(
  {
    test: SchemaType.Number({ description: 'Test setting value', default: 5000, exportable: true }),
    transform: SchemaType.Function([SchemaType.String()], SchemaType.String(), {
      description: 'Transform function applied to string data',
      default: (data: string) => data.toLowerCase(),
      exportable: true,
    }),
  },
  {
    $id: "YourNodeSettingstSchema",
  },
);

export {
  ConfigsSchema,
  CredentialsSchema,
  InputSchema,
  OutputSchema,
  SettingsSchema,
};
