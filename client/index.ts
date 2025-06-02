import remoteServer from "./nodes/remote-server";
import yourNode from "./nodes/your-node";
import { registerType } from "../core/client";

// TODO: is there a use case for controlling the order nodes in the editor are registered?
async function main() {
  try {
    console.log("Registering node types in parallel");
    await Promise.all([
      registerType("remote-server", remoteServer),
      registerType("your-node", yourNode),
    ]);
    console.log("All node types registered in parallel");
  } catch (error) {
    console.error("Error registering node types:", error);
  }
}

main();
