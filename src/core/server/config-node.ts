import { Static } from "@sinclair/typebox";

abstract class ConfigNode<TConfigs = any, TCredentials = any> {
  public readonly id: string;
  public readonly type: string;
  public readonly name: string;
  public readonly users: string[];

  protected readonly configs: TConfigs;
  protected readonly credentials?: TCredentials;

  constructor(configs: TConfigs) {
    ConfigNode.RED.nodes.createNode(this, configs);
    this.configs = configs;
    this.users = configs._users;
    this.z = configs.z;
    this.g = configs.g;
  }

  static init(): void | Promise<void> {
    console.log("not implemented");
  }

  protected getNode(nodeId: string): Node | ConfigNode {
    return ConfigNode.RED.nodes.getNode(nodeId);
  }
}

export { ConfigNode };
