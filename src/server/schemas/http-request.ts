import { SchemaType, defineSchema } from "@bonsae/nrg/server";

const ConfigsSchema = defineSchema(
  {
    name: SchemaType.String({ default: "http-request-custom" }),
    method: SchemaType.String({
      default: "GET",
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      "x-nrg-form": { icon: "random" },
    }),
    url: SchemaType.String({
      default: "",
      minLength: 1,
      "x-nrg-form": { icon: "globe" },
    }),
    body: SchemaType.String({
      default: "",
      "x-nrg-form": { icon: "code", editorLanguage: "json" },
    }),
    authType: SchemaType.String({
      default: "none",
      enum: ["none", "basic", "bearer"],
      "x-nrg-form": { icon: "lock" },
    }),
    username: SchemaType.String({
      default: "",
      "x-nrg-form": { icon: "user" },
    }),
    password: SchemaType.String({
      default: "",
      format: "password",
      "x-nrg-form": { icon: "key" },
    }),
    token: SchemaType.String({
      default: "",
      format: "password",
      "x-nrg-form": { icon: "key" },
    }),
    timeout: SchemaType.Number({
      default: 5000,
      minimum: 0,
      "x-nrg-form": { icon: "clock-o" },
    }),
    retries: SchemaType.Number({
      default: 0,
      minimum: 0,
      maximum: 10,
      "x-nrg-form": { icon: "repeat" },
    }),
    retryDelay: SchemaType.Number({
      default: 1000,
      minimum: 100,
      "x-nrg-form": { icon: "hourglass" },
    }),
  },
  {
    $id: "HttpRequestConfigsSchema",
    allOf: [
      // If method is POST/PUT/PATCH, body must not be empty
      {
        if: SchemaType.Object({
          method: SchemaType.String({ enum: ["POST", "PUT", "PATCH"] }),
        }),
        then: SchemaType.Object({
          body: SchemaType.String({ minLength: 1 }),
        }),
        errorMessage: {
          properties: {
            body: "Body is required for ${/method} requests",
          },
        },
      },
      // If authType is "basic", username and password are required
      {
        if: SchemaType.Object({
          authType: SchemaType.Literal("basic"),
        }),
        then: SchemaType.Object({
          username: SchemaType.String({ minLength: 1 }),
          password: SchemaType.String({ minLength: 1 }),
        }),
        errorMessage: {
          properties: {
            username: "Username is required for basic auth",
            password: "Password is required for basic auth",
          },
        },
      },
      // If authType is "bearer", token is required
      {
        if: SchemaType.Object({
          authType: SchemaType.Literal("bearer"),
        }),
        then: SchemaType.Object({
          token: SchemaType.String({ minLength: 1 }),
        }),
        errorMessage: {
          properties: {
            token: "Token is required for bearer auth",
          },
        },
      },
      // If retries > 0, retryDelay must be at least 100
      {
        if: SchemaType.Object({
          retries: SchemaType.Number({ exclusiveMinimum: 0 }),
        }),
        then: SchemaType.Object({
          retryDelay: SchemaType.Number({ minimum: 100 }),
        }),
        errorMessage: {
          properties: {
            retryDelay: "Retry delay is required when retries > 0",
          },
        },
      },
    ],
  },
);

export { ConfigsSchema };
