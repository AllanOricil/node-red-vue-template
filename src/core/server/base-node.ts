import { AnySchemaObject } from "ajv";
import { Static } from "@sinclair/typebox";
import { validatorService } from "./validator";
import { MessageSchema, BaseNodeConfigsSchema } from "../schemas";

type Message = Static<typeof MessageSchema>;

export type BaseNodeConfigs = Static<typeof BaseNodeConfigsSchema>;

export interface BaseNodeMetadata {
  validation?: {
    configs?: AnySchemaObject;
    credentials?: AnySchemaObject;
    input?: AnySchemaObject;
    outputs?: AnySchemaObject;
  };
}

export interface ContextStore {
  get(key: string): any;
  set(key: string, value: any): void;
}

export interface Context {
  flow: ContextStore;
  global: ContextStore;
  node: ContextStore;
}

// NOTE: these methods are implemented and defined by Node-RED runtime. They were added here to provide intelisense only.
export interface NodeRedRuntimeMethods {
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

declare module "./base-node" {
  interface BaseNode<TConfigs, TCredentials> extends NodeRedRuntimeMethods {}
}

export abstract class BaseNode<
  TConfigs extends BaseNodeConfigs = BaseNodeConfigs,
  TCredentials = any,
> {
  static RED: any;
  static type: string;

  public readonly id: string;
  public readonly type: string;
  public readonly name: string;
  public readonly z?: string;
  public readonly g?: string;

  public readonly configs: TConfigs;
  public readonly credentials?: TCredentials;

  public static readonly __nodeProperties__?: BaseNodeMetadata;

  constructor(configs: TConfigs) {
    BaseNode.RED.nodes.createNode(this, configs);
    this.configs = configs;
    this.id = configs.id;
    this.type = configs.type;
    this.name = configs.name;
    this.z = configs.z;
    this.g = configs.g;

    if (BaseNode.__nodeProperties__?.validation?.configs) {
      console.log("validating configs");
      console.log(this.configs);
      console.log(this);
      const validator = validatorService.createValidator(
        BaseNode.__nodeProperties__.validation?.configs
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

    if (BaseNode.__nodeProperties__?.validation?.credentials) {
      console.log("validating credentials");
      const validator = validatorService.createValidator(
        BaseNode.__nodeProperties__.validation?.credentials
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
