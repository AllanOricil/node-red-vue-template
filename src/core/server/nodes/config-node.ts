import { Static } from "@sinclair/typebox";
import { AnySchemaObject } from "ajv";
import { ConfigNodeConfigsSchema } from "../../schemas";
import { Node, ConfigNodeValidations } from "./node";

type ConfigNodeConfigs = Static<typeof ConfigNodeConfigsSchema>;

abstract class ConfigNode<
  TConfigs extends ConfigNodeConfigs = ConfigNodeConfigs,
  TCredentials = any,
> extends Node<TConfigs, TCredentials> {
  public static override readonly validations: ConfigNodeValidations;
  public readonly users: string[];

  constructor(configs: TConfigs) {
    super(configs);
    this.users = configs._users || [];
  }
}

export { ConfigNode, ConfigNodeConfigs };
