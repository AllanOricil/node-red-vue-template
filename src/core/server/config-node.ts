import { Static } from "@sinclair/typebox";

abstract class ConfigNode<TConfigs = any, TCredentials = any> {
  static readonly RED: any;

  public readonly id: string;
  public readonly type: string;
  public readonly name: string;
  public readonly users: string[];

  public readonly configs: TConfigs;
  public readonly credentials?: TCredentials;

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

  static getNode<T>(id: string): T | undefined {
    return this.RED.nodes.getNode(id) as T;
  }
}

export { ConfigNode };
