import { BaseNodeMetadata } from "./base-node";

function node(options: BaseNodeMetadata) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      static __nodeProperties__: BaseNodeMetadata = options;
    };
  };
}

export { node };
