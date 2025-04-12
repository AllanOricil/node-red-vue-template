import "reflect-metadata";
import { TypedInput } from "./typed-input";
import { ConfigNode } from "./config-node";
import * as Credential from "./credential";

function isSubclassOf(child: Function, parent: Function): boolean {
  if (child === parent) return false;

  let proto = child.prototype;
  while (proto) {
    proto = Object.getPrototypeOf(proto);
    if (proto?.constructor === parent) return true;
  }
  return false;
}

function input(target: any, key: string) {
  const ctor = target.constructor;
  const type = Reflect.getMetadata("design:type", target, key);

  if (!ctor.hasOwnProperty("__inputs__")) {
    Object.defineProperty(ctor, "__inputs__", {
      value: [],
      writable: true,
      configurable: true,
    });
  }

  const isConfigNode = isSubclassOf(type, ConfigNode);

  const config = {
    key,
    options: {
      ...(isConfigNode
        ? { configNodeType: type.__nodeProperties___.type }
        : {}),
      isTypedInput: type === TypedInput,
      isPasswordCredential: type === Credential.Password,
      isTextCredential: type === Credential.Text,
    },
  };

  console.log(config);
  ctor.__inputs__.push(config);
}

type NodeOptions = {
  type: string;
  category?: string;
  color?: string;
  inputs?: number;
  outputs?: number;
  icon?: string;
};

function node(options: NodeOptions) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      static __nodeProperties___ = options;
    };
  };
}

export { input, node };
