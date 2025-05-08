import { AnySchema } from "ajv";
import { Type } from "@sinclair/typebox";

function getDefaultsFromSchema(schema: AnySchema): Record<string, any> {
  const result: Record<string, any> = {};
  const properties = schema.properties || {};
  const requiredProps = Array.isArray(schema.required) ? schema.required : [];

  console.log("getDefaultsFromSchema");
  for (const [key, value] of Object.entries(properties)) {
    console.log(key);
    console.log(value);
    result[key] = {
      required: requiredProps.includes(key),
      value: value.default ?? "",
    };
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
  const requiredProps = Array.isArray(schema.required) ? schema.required : [];

  for (const [key, value] of Object.entries(properties)) {
    console.log(value);
    if (Array.isArray(value)) {
    }
    const isPassword = value.format === "password";

    result[key] = {
      type: isPassword ? "password" : "text",
      required: requiredProps.includes(key),
      value: value.default ?? "",
    };
  }

  return result;
}

function extendPatternWithPWD(pattern: string): string {
  const original = new RegExp(`^${pattern}$`);
  const pwd = /^__PWD__$/;
  const combined = new RegExp(`(?:${original.source}|${pwd.source})`);
  return combined.source;
}

function patchPasswordPatterns(schema: TSchema): void {
  if (!("properties" in schema)) return;

  const props = (schema as any).properties;

  for (const [key, value] of Object.entries(props)) {
    const prop = value as any;

    if (prop.format === "password" && typeof prop.pattern === "string") {
      prop.pattern = extendPatternWithPWD(prop.pattern);
      prop.minLength = 0; // optional: allow "__PWD__"
    }
  }
}

export {
  getDefaultsFromSchema,
  getCredentialsFromSchema,
  patchPasswordPatterns,
};
