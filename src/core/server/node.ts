import { AnySchemaObject } from "ajv";
import { Static } from "@sinclair/typebox";
import { MessageSchema, NodeConfigsSchema } from "../schemas";
import { validatorService } from "./validator";

type Message = Static<typeof MessageSchema>;
type NodeConfigs = Static<typeof NodeConfigsSchema>;

interface ConfigNodeValidations {
  configs?: AnySchemaObject;
  credentials?: AnySchemaObject;
}

interface IONodeValidations {
  configs?: AnySchemaObject;
  credentials?: AnySchemaObject;
  input?: AnySchemaObject;
  outputs?: AnySchemaObject;
}

type NodeValidations = ConfigNodeValidations | IONodeValidations;

interface ContextStore {
  get(key: string): any;
  set(key: string, value: any): void;
}

interface Context {
  flow: ContextStore;
  global: ContextStore;
  node: ContextStore;
}

// NOTE: these methods are implemented and defined by Node-RED runtime. They were added here to provide intelisense only.
declare module "./node" {
  interface Node<TConfigs, TCredentials> {
    updateWires(wires: string[][]): void;
    context(): Context;
    emit(event: string, ...args: any[]): void;
    removeListener(name: string): void;
    removeAllListeners(name: string): void;
    close(removed: boolean): Promise<void>;
    receive(msg: Message & { [key: string]: any }): void;
    error(logMessage: string, msg: any): void;
    debug(msg: any): void;
    trace(msg: any): void;
    log(msg: any): void;
    warn(msg: any): void;
    metric(
      eventName: string,
      msg: Message & { [key: string]: any },
      metricValue: number
    ): boolean | void;
    status(
      status:
        | { fill?: "red" | "green"; shape?: "dot" | "string"; text?: string }
        | string
    ): void;
  }
}

abstract class Node<
  TConfigs extends NodeConfigs = NodeConfigs,
  TCredentials = any,
> {
  static RED: any;
  static type: string;

  public static readonly validations?: NodeValidations;

  public readonly id: string;
  public readonly type: string;
  public readonly name: string;
  public readonly z?: string;
  public readonly g?: string;

  public readonly configs: TConfigs;
  public readonly credentials?: TCredentials;

  constructor(configs: TConfigs) {
    Node.RED.nodes.createNode(this, configs);
    this.configs = configs;
    this.id = configs.id;
    this.type = configs.type;
    this.name = configs.name;
    this.z = configs.z;
    this.g = configs.g;

    if (Node.validations?.configs) {
      console.log("validating configs");
      console.log(this.configs);
      console.log(this);
      const validator = validatorService.createValidator(
        Node.validations?.configs
      );
      const isConfigsValid = validator(this.configs);
      if (!isConfigsValid) {
        const errors = validatorService.errors(validator.errors, {
          separator: "\n",
          dataVar: "- configs",
        });
        console.error(errors);
      }
    }

    if (Node.validations?.credentials) {
      console.log("validating credentials");
      const validator = validatorService.createValidator(
        Node.validations?.credentials
      );
      const isCredentialsValid = validator(this.credentials);
      if (!isCredentialsValid) {
        const errors = validatorService.errors(validator.errors, {
          separator: "\n",
          dataVar: "- credentials",
        });
        console.error(errors);
      }
    }
  }

  static init(): void | Promise<void> {
    console.log("not implemented");
  }

  static getNode<T>(id: string): T | undefined {
    return this.RED.nodes.getNode(id) as T;
  }
}

export {
  Node,
  NodeConfigs,
  ConfigNodeValidations,
  IONodeValidations,
  NodeValidations,
  ContextStore,
  Context,
};
