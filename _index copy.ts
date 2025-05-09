import { YourNode } from "./_yournode";
import { RemoteServerConfigNode } from "./_server";
import { registerType } from "./node-factory";

// TODO: define RED type
export default async function (RED: any) {
  // NOTE: the order nodes are registered can be defined in nrg.config.registrationOrder
  // TODO: investigate if it is possible to run Khan's algorithm to determine the registration order
  await registerType(RED, "remote-server", RemoteServerConfigNode);
  await registerType(RED, "your-node", YourNode);
}
