import { Config } from "./decorators";
import { NodeRedConfigNode, NodeRedNode } from "./node";
import { createNodeRedNodeFactory } from "./helper";

export interface RemoteServerNodeProps {
  host: string;
}

export class RemoteServerNode extends NodeRedConfigNode {
  @Config
  host: string;

  constructor(config: RemoteServerNodeProps) {
    super(config);

    this.host = config.host;
  }
}

export default async function (RED: any) {
  await createNodeRedNodeFactory(RED)(RemoteServerNode, "remote-server");
}
