import { Static } from "@sinclair/typebox";
import { node } from "../../../core/server/decorators";
import { ConfigNode } from "../../../core/server/config-node";
import { ConfigsSchema } from "../schemas";

type Configs = Static<typeof ConfigsSchema>;

@node({
  validation: {
    configs: ConfigsSchema,
  },
})
export default class RemoteServerConfigNode extends ConfigNode<Configs> {
  // NOTE: run only once when node type is registered
  static override init() {
    console.log("server-node");
  }
}
