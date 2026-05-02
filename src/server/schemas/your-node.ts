import { SchemaType, defineSchema } from "@bonsae/nrg/server";
import RemoteServerConfigNode from "../nodes/remote-server";

const ConfigsSchema = defineSchema(
  {
    name: SchemaType.String({ default: "your-node" }),
    myProperty: SchemaType.TypedInput<string>(),
    myProperty2: SchemaType.TypedInput<number>(),
    remoteServer: SchemaType.NodeRef(RemoteServerConfigNode),
    anotherRemoteServer: SchemaType.NodeRef(RemoteServerConfigNode),
    country: SchemaType.String({ default: "brazil" }),
    fruit: SchemaType.Array(SchemaType.String(), {
      default: ["apple", "melon"],
    }),
    number: SchemaType.String({ default: "1" }),
    object: SchemaType.Array(SchemaType.String(), {
      default: [JSON.stringify({ test: "a" }), JSON.stringify({ test: "b" })],
    }),
    array: SchemaType.String({
      default: '["a"]',
    }),
    jsontest: SchemaType.String({ default: "" }),
    csstest: SchemaType.String({ default: "" }),
  },
  {
    $id: "YourNodeConfigsSchema",
  },
);

const CredentialsSchema = defineSchema(
  {
    password: SchemaType.Optional(
      SchemaType.String({
        default: "",
        minLength: 8,
        maxLength: 20,
        pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.source,
        format: "password",
      }),
    ),
    password2: SchemaType.Optional(
      SchemaType.String({
        default: "",
        pattern:
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            .source,
        format: "password",
      }),
    ),
    username: SchemaType.Optional(
      SchemaType.String({ default: "", maxLength: 10, minLength: 5 }),
    ),
  },
  {
    $id: "YourNodeCredentialsSchema",
  },
);

const InputSchema = defineSchema(
  {
    myVariable: SchemaType.Optional(SchemaType.String()),
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
    ]),
    processedTime: SchemaType.Number(),
  },
  {
    $id: "YourNodeOutputSchema",
  },
);

const SettingsSchema = defineSchema(
  {
    test: SchemaType.Number({ default: 5000, exportable: true }),
    transform: SchemaType.Function([SchemaType.String()], SchemaType.String(), {
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
