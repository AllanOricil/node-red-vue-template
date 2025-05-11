import { AnySchemaObject } from "ajv";
import { Type } from "@sinclair/typebox";

function getDefaultsFromSchema(
  schema: AnySchemaObject
): Record<string, { type?: string; required: boolean; value: any }> {
  const result: Record<
    string,
    { type?: string; required: boolean; value: any }
  > = {};
  const requiredProps =
    schema && "required" in schema && Array.isArray(schema.required)
      ? schema.required
      : [];

  console.log(requiredProps);

  console.log("getDefaultsFromSchema");
  for (const [key, value] of Object.entries(schema.properties)) {
    console.log(key);
    console.log(value);
    if (value && typeof value === "object" && "default" in value) {
      result[key] = {
        required: requiredProps.includes(key),
        value: value.default ?? "",
      };

      // Check if value has a nodeType property
      if ("nodeType" in value) {
        result[key].type = value.nodeType as string;
      }
    }
  }

  return result;
}

function getCredentialsFromSchema(
  schema: AnySchemaObject
): Record<string, { type: string; required: boolean; value: any }> {
  const result: Record<
    string,
    { type: string; required: boolean; value: any }
  > = {};
  const requiredProps = Array.isArray(schema.required) ? schema.required : [];

  for (const [key, value] of Object.entries(schema.properties)) {
    console.log(value);
    if (value && typeof value === "object" && "format" in value) {
      const typedValue = value as { format?: string; default?: any };
      const isPassword = typedValue.format === "password";

      result[key] = {
        type: isPassword ? "password" : "text",
        required: requiredProps.includes(key),
        value: typedValue.default ?? "",
      };
    }
  }

  return result;
}

function extendPatternWithPWD(pattern: string): string {
  const original = new RegExp(`^${pattern}$`);
  const pwd = /^__PWD__$/;
  const combined = new RegExp(`(?:${original.source}|${pwd.source})`);
  return combined.source;
}

function patchPasswordPatterns(schema: AnySchemaObject): void {
  for (const [key, value] of Object.entries(schema.properties)) {
    if (
      value &&
      typeof value === "object" &&
      "format" in value &&
      value.format === "password" &&
      "pattern" in value &&
      typeof value.pattern === "string" &&
      "minLength" in value
    ) {
      value.pattern = extendPatternWithPWD(value.pattern);
      value.minLength = 0;
    }
  }
}

export {
  getDefaultsFromSchema,
  getCredentialsFromSchema,
  patchPasswordPatterns,
};
