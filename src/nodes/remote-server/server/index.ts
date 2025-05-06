import { node } from "../../../core/server/decorators";
import { Node } from "../../../core/server/node";
import { ConfigsSchema } from "../schemas";

type Configs = Static<typeof ConfigsSchema>;

@node({
  validation: {
    configs: ConfigsSchema,
  },
})
export class RemoteServerConfigNode extends Node<Configs> {
  host: string;

  // NOTE: run only once when node type is registered
  static init() {
    console.log("server-node");
  }
}
