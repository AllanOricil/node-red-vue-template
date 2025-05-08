import { Static } from "@sinclair/typebox";

abstract class ConfigNode<TConfigs = any, TCredentials = any> {
  public readonly id: string;
  public readonly type: string;
  public readonly name: string;
  public readonly _users?: string[];
  public readonly x?: number;
  public readonly y?: number;
  public readonly z?: string;
  public readonly g?: string;

  protected readonly configs: TConfigs;
  protected readonly credentials?: TCredentials;

  constructor(configs: TConfigs) {
    Node.RED.nodes.createNode(this, configs);
    this.configs = configs;
  }

  static init(): void | Promise<void> {
    console.log("not implemented");
  }

  protected getNode(nodeId: string): Node {
    return Node.RED.nodes.getNode(nodeId);
  }
}

export { ConfigNode };
