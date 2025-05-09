import { TSchema } from "@sinclair/typebox";

type NodeOptions = {
  schemas?: {
    configs?: TSchema;
    credentials?: TSchema;
    inputMessage?: TSchema;
    outputMessage?: TSchema;
  };
};

function node(options: NodeOptions) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      static __nodeProperties___: NodeOptions = options;
    };
  };
}

export { config, node };
