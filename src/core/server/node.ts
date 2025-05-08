import { Static } from "@sinclair/typebox";
import MessageSchema from "../schemas/message";

type SendFunction<T> = (data: T | T[]) => void;
type InputDoneFunction = (error?: Error) => void;
type CloseDoneFunction = () => void;

type Message = Static<typeof MessageSchema>;

abstract class Node<
  TConfigs = any,
  TCredentials = any,
  TInputMessage = Message,
  TOutputMessage = Message | Message[] | (Message | null)[],
> {
  static readonly RED: any;

  public readonly id: string;
  public readonly type: string;
  public readonly name: string;
  public readonly wires: string[][];
  public readonly x?: number;
  public readonly y?: number;
  public readonly z?: string;
  public readonly g?: string;
  public readonly configs: TConfigs;
  public readonly credentials?: TCredentials;

  constructor(configs: TConfigs) {
    Node.RED.nodes.createNode(this, configs);
    this.configs = configs;
    this.x = configs.x;
    this.y = configs.y;
    this.z = configs.z;
    this.g = configs.g;
  }

  static init(): void | Promise<void> {
    console.log("not implemented");
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

  static getNode<T>(id: string): T | undefined {
    return this.RED.nodes.getNode(id) as T;
  }
}

export { Node, SendFunction, InputDoneFunction, CloseDoneFunction };
