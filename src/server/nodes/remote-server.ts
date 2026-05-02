import type { Schema, Infer } from "@bonsae/nrg/server";
import { ConfigNode, type RED } from "@bonsae/nrg/server";
import { ConfigsSchema } from "../schemas/remote-server";
import type YourNode from "./your-node";

export type Config = Infer<typeof ConfigsSchema>;

// NOTE: category doesn't need to be set because all config nodes are set with "config"
export default class RemoteServerConfigNode extends ConfigNode<Config> {
  public static override readonly type: string = "remote-server";
  public static override readonly description =
    "Configuration node representing a remote server connection.";
  public static override readonly configSchema: Schema = ConfigsSchema;

  // NOTE: run only once when node type is registered
  public static override async registered(RED: RED): Promise<void> {
    try {
      RED.log.info(`Registering ${this.type}`);
      const response = await fetch("https://dog.ceo/api/breeds/image/random");
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      RED.log.info(json);

      RED.log.info(`${this.type} registered`);
    } catch (error) {
      if (error instanceof Error) {
        RED.log.error("Error while fetching dogs: ", error.message);
      } else {
        RED.log.error("Unknown error occurred: ", error);
      }
    }
  }

  public override async closed(): Promise<void> {
    this.log(`Closed ${RemoteServerConfigNode.type} - ${this.name}`);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 3 seconds
  }

  override get users(): YourNode[] {
    return super.users as YourNode[];
  }

  // NOTE: context is protected to force encapsulation. Developers must expose methods inside a node's class to grant access to the context from another node
  public getData() {
    return this.context.node.get("data");
  }
}
