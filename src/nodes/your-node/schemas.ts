import { Type, Static } from "@sinclair/typebox";
import MessageSchema from "../../core/schemas/message";
import TypedInputSchema from "../../core/schemas/typed-input";

const ConfigsSchema = Type.Object(
  {
    name: Type.String({ default: "your-node" }),
    myProperty: TypedInputSchema,
    myProperty2: TypedInputSchema,
    remoteServer: Type.String({ nodeType: "remote-server" }),
    anotherRemoteServer: Type.Optional(
      Type.String({ nodeType: "remote-server" })
    ),
    country: Type.String({ default: "brazil" }),
    fruit: Type.Array(Type.String(), { default: ["apple", "melon"] }),
    number: Type.String({ default: "1" }),
    object: Type.Array(Type.String(), {
      default: [JSON.stringify({ test: "a" }), JSON.stringify({ test: "b" })],
    }),
    array: Type.String({
      default: '["a"]',
    }),
    jsontest: Type.String({ default: "" }),
    csstest: Type.String({ default: "" }),
  },
  {
    $id: "YourNodeConfigsSchema",
  }
);

const CredentialsSchema = Type.Object(
  {
    password: Type.Optional(
      Type.String({
        default: "",
        minLength: 8,
        maxLength: 20,
        pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.source,
        format: "password",
      })
    ),
    password2: Type.Optional(
      Type.String({
        default: "",
        pattern:
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            .source,
        format: "password",
      })
    ),
    username: Type.Optional(
      Type.String({ default: "", maxLength: 10, minLength: 5 })
    ),
  },
  {
    $id: "YourNodeCredentialsSchema",
  }
);

const InputMessageSchema = Type.Intersect(
  [
    MessageSchema,
    Type.Object({
      myVariable: Type.Optional(Type.String()),
    }),
  ],
  {
    $id: "YourNodeInputMessageSchema",
  }
);

const OutputMessageSchema = Type.Intersect(
  [
    MessageSchema,
    Type.Object({
      originalType: Type.Union([
        Type.Literal("string"),
        Type.Literal("number"),
      ]),
      processedTime: Type.Number(),
    }),
    Type.Unknown(),
  ],
  { $id: "YourNodeOutputMessageSchema" }
);

export {
  ConfigsSchema,
  CredentialsSchema,
  InputMessageSchema,
  OutputMessageSchema,
};
