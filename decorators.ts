import "reflect-metadata";
import { TypedInput } from "./typed-input";
import { ConfigNode } from "./config-node";
import * as Credential from "./credential";
import { JSONSchema7 } from "json-schema";

function input(target: any, key: string) {
  const ctor = target.constructor;
  const type = Reflect.getMetadata("design:type", target, key);

  if (!ctor.hasOwnProperty("__inputs__")) {
    Object.defineProperty(ctor, "__inputs__", {
      value: [],
      writable: true,
      configurable: true,
      enumerable: false,
    });
  }

  const config = {
    key,
    type: type,
  };

  console.log(config);
  ctor.__inputs__.push(config);

  // TODO: find a way to convert using prop acessors
}

type NodeOptions = {
  type: string;
  category?: string;
  color?: string;
  inputs?: number;
  outputs?: number;
  icon?: string;
  schema?: {
    inputs?: JSONSchema7;
    message?: JSONSchema7;
  };
};

function node(options: NodeOptions) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      static __nodeProperties___: NodeOptions = options;
    };
  };
}

export { input, node };
