import { BaseNode, BaseNodeConfigs } from "./base-node";
import { Static } from "@sinclair/typebox";
import { MessageSchema, NodeConfigsSchema } from "../schemas";
import { validatorService } from "./validator";

export type NodeConfigs = Static<typeof NodeConfigsSchema>;

type SendFunction<T> = (data: T | T[]) => void;
type InputDoneFunction = (error?: Error | string) => void;
type CloseDoneFunction = () => void;

type Message = Static<typeof MessageSchema>;

// NOTE: these methods are implemented and defined by Node-RED runtime. They were added here to provide intelisense only.
export interface NodeRedRuntimeMethods<TInputMessage> {
  on(event: string, callback: (...args: any[]) => void): void;
  send(msg: TInputMessage): void;
}

declare module "./node" {
  interface Node<TConfigs, TCredentials, TInputMessage, TOutputMessage>
    extends NodeRedRuntimeMethods<TInputMessage> {}
}

abstract class Node<
  TConfigs extends NodeConfigs = NodeConfigs,
  TCredentials = any,
  TInputMessage = Message,
  TOutputMessage = Message | Message[] | (Message | null)[],
> extends BaseNode<TConfigs, TCredentials> {
  public readonly wires: string[][];
  public readonly x?: number;
  public readonly y?: number;

  constructor(configs: TConfigs) {
    super(configs);
    this.wires = configs.wires;
    this.x = configs.x;
    this.y = configs.y;

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
            const inputSchema = Node.__nodeProperties__?.validation?.input;
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

export { Node, SendFunction, InputDoneFunction, CloseDoneFunction };
