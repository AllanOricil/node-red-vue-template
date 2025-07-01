import { AnySchemaObject } from "ajv";
import { Static } from "@sinclair/typebox";
import { NodeConfigsSchema } from "../../schemas";
import { validatorService } from "../validator";

type CloseDoneFunction = () => void;
type NodeConfigs = Static<typeof NodeConfigsSchema>;

interface ConfigNodeValidations {
  configs: AnySchemaObject;
  credentials?: AnySchemaObject;
}

interface IONodeValidations {
  configs: AnySchemaObject;
  credentials?: AnySchemaObject;
  input?: AnySchemaObject;
  outputs?: AnySchemaObject;
}

type NodeValidations = ConfigNodeValidations | IONodeValidations;

// NOTE: these methods are implemented and defined by Node-RED runtime. They were added here to provide intelisense only.
// TODO: on is declared here but config nodes shouldn't have it
declare module "./node" {
  interface Node<TConfigs, TCredentials> {
    close(removed: boolean): Promise<void>;
    on(event: string, callback: (...args: any[]) => void): void;
    error(logMessage: string, msg: any): void;
    debug(msg: any): void;
    trace(msg: any): void;
    log(msg: any): void;
    warn(msg: any): void;
  }
}

abstract class Node<
  TConfigs extends NodeConfigs = NodeConfigs,
  TCredentials = any,
> {
  static RED: any;
  static type: string;

  public static readonly validations: NodeValidations;

  public readonly id: string;
  public readonly type: string;
  public readonly name: string;
  public readonly z?: string;

  public readonly configs: TConfigs;
  public readonly credentials?: TCredentials;

  constructor(configs: TConfigs) {
    Node.RED.nodes.createNode(this, configs);
    this.configs = configs;
    this.id = configs.id;
    this.type = configs.type;
    this.name = configs.name;
    this.z = configs.z;

    if (Node.validations?.configs) {
      console.log("validating configs");
      console.log(this.configs);
      console.log(this);
      const validator = validatorService.createValidator(
        Node.validations?.configs,
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
        Node.validations?.credentials,
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

    this.registerOnCloseEventHandler();
  }

  // TODO: why is method overloading enforcing subclasses to implement all possible ones even the base class has implementation for all methods
  onClose(
    param1?: boolean | CloseDoneFunction,
    param2?: CloseDoneFunction,
  ): void {
    const removed = typeof param1 === "boolean" ? param1 : undefined;
    const done = typeof param1 === "function" ? param1 : param2;

    if (removed !== undefined) {
      console.log(`${this.type} - ${this.name}: removed ${removed}`);
    }

    done?.();
  }

  static init(): void | Promise<void> {
    console.log("not implemented");
  }

  static getNode<T>(id: string): T | undefined {
    return this.RED.nodes.getNode(id) as T;
  }

  /**
   * NOTE: register onClose event handler
   */
  private registerOnCloseEventHandler() {
    if (!this.onClose) return;
    this.on("close", this.onClose);
  }
}

export {
  ConfigNodeValidations,
  Node,
  NodeConfigs,
  NodeValidations,
  IONodeValidations,
  CloseDoneFunction,
};
