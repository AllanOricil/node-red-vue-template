import { input, node } from "./decorators";
import { ConfigNode } from "./config-node";
import InputsSchema from "./remote-server-inputs-schema";

@node({
  type: "remote-server",
  validation: {
    inputs: InputsSchema,
  },
})
export class RemoteServerConfigNode extends ConfigNode {
  @input
  host: string;

  // NOTE: run only once when node type is registered
  static async init() {
    console.log("0");
    await fetch("https://google.com");
    console.log("1");
    await fetch("https://node-ready.com");
    console.log("2");
    await fetch("https://google.com");
    console.log("3");
    await fetch("https://node-ready.com");
    console.log("4");
  }
}
