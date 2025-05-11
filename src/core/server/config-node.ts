import { BaseNode, BaseNodeConfigs } from "./base-node";
import { ConfigNodeConfigsSchema } from "../schemas";
import { Static } from "@sinclair/typebox";

export type ConfigNodeConfigs = Static<typeof ConfigNodeConfigsSchema>;

abstract class ConfigNode<
  TConfigs extends ConfigNodeConfigs = ConfigNodeConfigs,
  TCredentials = any,
> extends BaseNode<TConfigs, TCredentials> {
  public readonly users: string[];

  constructor(configs: TConfigs) {
    super(configs);
    this.users = configs._users;
  }
}

export { ConfigNode };
