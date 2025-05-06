import { AnySchema } from "ajv";

function getDefaultsFromSchema(schema: AnySchema): Record<string, any> {
  const result: Record<string, any> = {};
  const properties = schema.properties || {};

  console.log("getDefaultsFromSchema");
  for (const [key, value] of Object.entries(properties)) {
    console.log(key);
    console.log(value);
    result[key] = { required: false, value: value.default ?? "" };
    if ("nodeType" in value) {
      result[key].type = value.nodeType;
    }
  }

  return result;
}

function getCredentialsFromSchema(
  schema: TSchema
): Record<string, { type: string; password?: boolean }> {
  const result: Record<string, { type: string; password?: boolean }> = {};
  const properties = schema.properties || {};

  for (const [key, value] of Object.entries(properties)) {
    console.log(value);
    const isPassword = value.format === "password";

    result[key] = {
      type: isPassword ? "password" : "text",
      value: value.default ?? "",
    };
  }

  return result;
}

export { getDefaultsFromSchema, getCredentialsFromSchema };
