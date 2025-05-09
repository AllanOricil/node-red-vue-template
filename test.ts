// Define TypedInput type
export type TypedInput = {
  type: string;
  value: any;
};

// Create a utility to define typed config with defaults
export function defineNodeConfig<T extends Record<string, any>>(config: {
  [K in keyof T]: T[K] extends TypedInput ? TypedInput : T[K];
}) {
  // Define the runtime type automatically
  type RuntimeType = {
    [K in keyof T as T[K] extends TypedInput ? never : K]: T[K];
  } & {
    [K in keyof T as T[K] extends TypedInput ? K : never]: any;
  } & {
    [K in keyof T as T[K] extends TypedInput
      ? `${string & K}Type`
      : never]: string;
  };

  // Create runtime properties from typed properties
  const runtimeDefaults: Partial<RuntimeType> = {} as any;

  for (const key in config) {
    const value = config[key];
    if (
      value &&
      typeof value === "object" &&
      "type" in value &&
      "value" in value
    ) {
      // It's a TypedInput, split it
      runtimeDefaults[key as keyof RuntimeType] = value.value;
      runtimeDefaults[`${key}Type` as keyof RuntimeType] = value.type;
    } else {
      // Regular property
      runtimeDefaults[key as keyof RuntimeType] = value as any;
    }
  }

  return {
    // Expose the typed config for TypeScript
    typedConfig: config,
    // Expose the runtime defaults for Node-RED
    defaults: runtimeDefaults,
    // Expose the types for TypeScript
    _types: {} as {
      typed: typeof config;
      runtime: RuntimeType;
    },
  };
}

// Helper for creating typed inputs
export function typedInput(type: string, value: any): TypedInput {
  return { type, value };
}
