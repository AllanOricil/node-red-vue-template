import YourNode from "./nodes/your-node";
import RemoteServerConfigNode from "./nodes/remote-server";
import { registerType } from "../../core/server";

export { YourNode, RemoteServerConfigNode };

// NOTE: this root module can be used to manually control the order nodes are registered
// TODO: define RED type
export default async function (RED: any): Promise<void> {
  try {
    console.log("Registering node types in series");
    // TODO: the order nodes are registered will be defined in nrg.config.ts. If not provided, it will be registered alphabetically based on the folder names
    // TODO: investigate if it is possible to run Khan's algorithm to determine the registration order
    await registerType(RED, "remote-server", RemoteServerConfigNode);
    await registerType(RED, "your-node", YourNode);

    // TODO: add the order in the message
    console.log("All node types registered in series");
  } catch (error) {
    console.error("Error registering node types:", error);
  }
}
