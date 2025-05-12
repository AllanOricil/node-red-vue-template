import { Static } from "@sinclair/typebox";
import { ConfigNode, ConfigNodeValidations } from "../../../core/server/nodes";
import { ConfigsSchema } from "../schemas";

export type RemoteServerConfigs = Static<typeof ConfigsSchema>;

export default class RemoteServerConfigNode extends ConfigNode<RemoteServerConfigs> {
  static override validations: ConfigNodeValidations = {
    configs: ConfigsSchema,
  };

  // NOTE: run only once when node type is registered
  static override init() {
    console.log("server-node");
  }
}
