import { YourNode } from "./_yournode";
import { RemoteServerConfigNode } from "./_server";
import { NodeFactory } from "./node-factory";

export default async function (RED: any) {
  // NOTE: the order nodes are registered can be defined in nrg.config.registrationOrder
  // TODO: investigate if it is possible to run Khan's algorithm to determine the registration order
  await NodeFactory.registerType(RED, RemoteServerConfigNode);
  await NodeFactory.registerType(RED, YourNode);
}
