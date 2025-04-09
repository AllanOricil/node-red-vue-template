import "reflect-metadata";
import { NodeRedConfigNode, TypedInput } from "./node";

function Secret(options: { type: "text" | "password"; required?: boolean }) {
  return function (target: any, key: string) {
    const ctor = target.constructor;
    if (!ctor.hasOwnProperty("__secrets__")) {
      Object.defineProperty(ctor, "__secrets__", {
        value: [],
        writable: true,
        configurable: true,
      });
    }

    target.constructor.__secrets__.push({
      key,
      type: options.type,
      required: options.required || false,
    });
  };
}

function isSubclassOf(child: Function, parent: Function): boolean {
  if (child === parent) return false;

  let proto = child.prototype;
  while (proto) {
    proto = Object.getPrototypeOf(proto);
    if (proto?.constructor === parent) return true;
  }
  return false;
}

function Config(target: any, key: string) {
  const ctor = target.constructor;
  const type = Reflect.getMetadata("design:type", target, key);

  if (!ctor.hasOwnProperty("__configProps__")) {
    Object.defineProperty(ctor, "__configProps__", {
      value: [],
      writable: true,
      configurable: true,
    });
  }

  const config = {
    key,
    options: {
      configNode: isSubclassOf(type, NodeRedConfigNode),
      typedInput: type === TypedInput,
    },
  };

  console.log(config);
  ctor.__configProps__.push(config);
}

type EditorOptions = {
  category: string;
  color: string;
  inputs: number;
  outputs: number;
  icon: string;
};

function Editor(options: EditorOptions) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      static editorProperties = options;
    };
  };
}

export { Config, Secret, Editor };
