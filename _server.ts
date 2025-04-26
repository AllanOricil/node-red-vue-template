import { config, node } from "./decorators";
import { ConfigNode } from "./config-node";
import InputsSchema from "./remote-server-inputs-schema";

@node({
  type: "remote-server",
  validation: {
    inputs: InputsSchema,
  },
})
export class RemoteServerConfigNode extends ConfigNode {
  @config
  host: string;

  // NOTE: run only once when node type is registered
  static init() {
    console.log("server-node");
  }
}
