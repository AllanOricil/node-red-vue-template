import { Static } from "@sinclair/typebox";
import { ConfigNodeConfigsSchema } from "../../schemas";
import { Node, ConfigNodeValidations } from "./node";

type ConfigNodeConfigs = Static<typeof ConfigNodeConfigsSchema>;

abstract class ConfigNode<
  TConfigs extends ConfigNodeConfigs = ConfigNodeConfigs,
  TCredentials = any,
> extends Node<TConfigs, TCredentials> {
  public static override readonly validations: ConfigNodeValidations;

  constructor(configs: TConfigs) {
    super(configs);
  }
}

export { ConfigNode, ConfigNodeConfigs };
