import { Config, Secret, Editor } from "./decorators";
import { RemoteServerNode } from "./_server";
import { NodeRedNode, TypedInput } from "./node";
import { createNodeRedNodeFactory } from "./helper";

interface TypedInput {
  value: any;
  type: string;
  evaluate: (msg: Record<string, any>) => Promise<any>;
}

type Credential = string;

type ConfigNodeId = string;

interface YourNodeProps {
  myProperty: TypedInput;
  remoteServer: ConfigNodeId;
  country: string;
  fruit: string;
  csstest: string;
  jsontest: string;
}

@Editor({
  category: "function",
  color: "#000000",
  inputs: 1,
  outputs: 1,
  icon: "node.svg",
})
export class YourNode extends NodeRedNode {
  @Config
  myProperty: TypedInput;

  @Config
  remoteServer: RemoteServerNode;

  @Secret({ type: "text", required: true })
  username: Credential;

  @Secret({ type: "password" })
  password: Credential;

  async onInput(
    msg: Record<string, any>,
    send: Function,
    done: Function
  ): void {
    console.log(this);
    console.log(msg);

    // NOTE: typedInput props are automatically assigned using TypedInput type
    console.log(this.myProperty.type);
    console.log(this.myProperty.value);
    console.log(await this.myProperty.evaluate(msg));

    // NOTE: config node props are automatically assigned using the config node type
    console.log(this.remoteServer.type);
    console.log(this.remoteServer.host);

    // NOTE: credentials are automatically assigned
    console.log(this.username);
    console.log(this.password);
    done();
  }
}

export default async function (RED: any) {
  await createNodeRedNodeFactory(RED)(YourNode, "your-node");
}
