import { Type, Static } from "@sinclair/typebox";
import MessageSchema from "../../core/schemas/message";
import TypedInputSchema from "../../core/schemas/typed-input";

const ConfigsSchema = Type.Object({
  name: Type.String({ default: "your-node" }),
  myProperty: TypedInputSchema,
  myProperty2: TypedInputSchema,
  country: Type.String({ default: "brasil" }),
  server: Type.Optional(Type.String({ nodeType: "remote-server" })),
});

const CredentialsSchema = Type.Object({
  password: Type.Optional(
    Type.String({
      default: "",
      minLength: 8,
      maxLength: 20,
      pattern: "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]+$",
      format: "password",
    })
  ),
  username: Type.Optional(
    Type.String({ default: "", maxLength: 10, minLength: 5 })
  ),
});

const InputMessageSchema = Type.Intersect(
  [
    MessageSchema,
    Type.Object({
      myVariable: Type.Optional(Type.String()),
    }),
  ],
  {
    $id: "InputMessageSchema",
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
  { $id: "OutputMessageSchema" }
);

export {
  ConfigsSchema,
  CredentialsSchema,
  InputMessageSchema,
  OutputMessageSchema,
};
