import { YourNode } from "./_yournode";
import { RemoteServerConfigNode } from "./_server";
import { createNodeRedNodeFactory } from "./helper";

export default async function (RED: any) {
  const factory = createNodeRedNodeFactory(RED);
  // NOTE: the order nodes are registered can be defined in nrg.config.registrationOrder
  // TODO: investigate if it is possible to run Khan's algorithm to determine the registration order
  await factory(RemoteServerConfigNode);
  await factory(YourNode);
}
