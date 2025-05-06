import { AnySchema } from "ajv";

type NodeOptions = {
  validation?: {
    configs: AnySchema;
    credentials: AnySchema;
    input: AnySchema;
    outputs: AnySchema;
  };
};

function node(options: NodeOptions) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      static __nodeProperties___: NodeOptions = options;
    };
  };
}

export { node };
