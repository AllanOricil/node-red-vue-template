import { input, node } from "./decorators";
import { RemoteServerConfigNode } from "./_server";
import { Node } from "./node";
import { TypedInput } from "./typed-input";
import * as Credential from "./credential";

@node({
  type: "your-node",
  category: "function",
  color: "#000000",
  inputs: 1,
  outputs: 1,
  icon: "node.svg",
})
export class YourNode extends Node {
  @input
  myProperty: TypedInput;

  @input
  remoteServer: RemoteServerConfigNode;

  @input
  fruit: string;

  @input
  country: string;

  @input
  number: number;

  @input
  object: object;

  @input
  array: Array;

  @input
  jsontest: string;

  @input
  csstest: string;

  @input
  username: Credential.Text;

  @input
  password: Credential.Password;

  // NOTE: run only once when node type is registered
  static async init() {
    await fetch("https://google.com");
    console.log("fetched google");
  }

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

    console.log(this.number);
    console.log(this.object);
    console.log(this.object.test);
    console.log(this.array);
    console.log(this.array[0]);

    console.log(typeof this.number);
    console.log(typeof this.object);
    console.log(Array.isArray(this.array));

    done();
  }
}
