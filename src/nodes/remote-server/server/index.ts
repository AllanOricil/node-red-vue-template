import { Static } from "@sinclair/typebox";
import { ConfigNode } from "../../../core/server/nodes/config-node";
import { ConfigsSchema } from "../schemas";
import { ConfigNodeValidations } from "../../../core/server/nodes";

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
