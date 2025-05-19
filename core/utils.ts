import { AnySchemaObject } from "ajv";

function getDefaultsFromSchema(
  schema: AnySchemaObject,
): Record<string, { type?: string; required: boolean; value: any }> {
  const result: Record<
    string,
    { type?: string; required: boolean; value: any }
  > = {};

  console.log("getDefaultsFromSchema");
  for (const [key, value] of Object.entries(schema.properties)) {
    // NOTE: these are excluded from defaults because they must be set by the editor
    if (["x", "y", "z", "g", "wires", "type", "id"].includes(key)) continue;
    const property = value as { default?: any; nodeType?: string };
    console.log(key);
    console.log(property);

    result[key] = {
      // NOTE: required is defined by the JSON Schema
      required: false,
      value: property.default ?? undefined,
      // NOTE: I'm using a custom json schema keyword to determine the node type
      type: property.nodeType,
    };
  }

  return result;
}

function getCredentialsFromSchema(
  schema: AnySchemaObject,
): Record<string, { type: string; required: boolean; value: any }> {
  const result: Record<
    string,
    { type: string; required: boolean; value: any }
  > = {};

  for (const [key, value] of Object.entries(schema.properties)) {
    const property = value as {
      default?: any;
      format: string;
      nodeType?: string;
    };
    console.log(property);
    const isPassword = property.format === "password";
    result[key] = {
      // NOTE: required is defined by the JSON Schema
      required: false,
      type: isPassword ? "password" : "text",
      value: property.default ?? undefined,
    };
  }

  return result;
}

export { getDefaultsFromSchema, getCredentialsFromSchema };
