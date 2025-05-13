import { Static } from "@sinclair/typebox";
import { AnySchemaObject } from "ajv";
import { MessageSchema, IONodeConfigsSchema } from "../../schemas";
import { validatorService } from "../validator";
import { Node, IONodeValidations } from "./node";

type CloseDoneFunction = () => void;
type InputDoneFunction = (error?: Error | string) => void;
type IONodeConfigs = Static<typeof IONodeConfigsSchema>;
type Message = Static<typeof MessageSchema>;
type SendFunction<T> = (data: T | T[]) => void;
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
declare module "./io-node" {
  interface IONode<TConfigs, TCredentials, TInputMessage, TOutputMessage> {
    close(removed: boolean): Promise<void>;
    context(): Context;
    emit(event: string, ...args: any[]): void;
    on(event: string, callback: (...args: any[]) => void): void;
    receive(msg: Message & { [key: string]: any }): void;
    removeAllListeners(name: string): void;
    removeListener(name: string): void;
    send(msg: TInputMessage): void;
    updateWires(wires: string[][]): void;
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

abstract class IONode<
  TConfigs extends IONodeConfigs = IONodeConfigs,
  TCredentials = any,
  TInputMessage = Message,
  TOutputMessage = Message | Message[] | (Message | null)[],
> extends Node<TConfigs, TCredentials> {
  public static override readonly validations: IONodeValidations;

  public readonly wires: string[][];
  public readonly x: number;
  public readonly y: number;

  constructor(configs: TConfigs) {
    super(configs);

    this.x = configs.x;
    this.y = configs.y;
    this.wires = configs.wires || [[]];

    console.log("SETUP EVENT HANDLERS");
    this.setupEventHandlers();
  }

  abstract onInput(
    msg: TInputMessage,
    send: SendFunction<TOutputMessage>,
    done: InputDoneFunction
  ): void | Promise<void>;

  abstract onClose(
    removed: boolean,
    done: CloseDoneFunction
  ): void | Promise<void>;

  /**
   * Sets up event handlers for the node. Automatically binds methods starting with "on" from the base class
   * to their corresponding events.
   */
  private setupEventHandlers() {
    console.log("INSIDE SETUPTEVENTHANDLERS");
    if (this.onInput) {
      console.log("REGISTERING ON INPUT");
      this.on(
        "input",
        async (
          msg: TInputMessage,
          send: SendFunction<TOutputMessage>,
          done: InputDoneFunction
        ) => {
          try {
            const inputSchema = IONode.validations?.input;
            if (inputSchema) {
              console.log("validating message");
              const messageValidator =
                validatorService.createValidator(inputSchema);
              const isValid = messageValidator(msg);
              if (!isValid) {
                const errors = validatorService.errors(
                  messageValidator.errors,
                  {
                    separator: "\n",
                    dataVar: "- message",
                  }
                );
                console.error(errors);
                return done(errors);
              }
            }

            await Promise.resolve(this.onInput(msg, send, done));
          } catch (error) {
            if (error instanceof Error) {
              this.error("Error while processing input: " + error.message, msg);
              done(error);
            } else {
              this.error("Unknown error occurred during input handling", msg);
              done("Unknown error occurred during input handling");
            }
          }
        }
      );
    }
    if (this.onClose) {
      this.on("close", this.onClose);
    }
  }
}

export {
  CloseDoneFunction,
  Context,
  ContextStore,
  InputDoneFunction,
  IONode,
  IONodeConfigs,
  SendFunction,
};
