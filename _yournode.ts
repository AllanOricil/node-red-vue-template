import { config, node } from "./decorators";
import { RemoteServerConfigNode } from "./_server";
import { Node } from "./node";
import { TypedInput } from "./typed-input";
import * as Credential from "./credential";
import InputsSchema from "./inputs-schema";
import MessageSchema from "./message-schema";

@node({
  type: "your-node",
  validation: {
    inputs: InputsSchema,
    message: MessageSchema,
  },
})
export class YourNode extends Node {
  @config
  myProperty: TypedInput;

  @config
  remoteServer: RemoteServerConfigNode;

  @config
  fruit: string;

  @config
  country: string;

  @config
  number: number;

  @config
  object: object;

  @config
  array: Array;

  @config
  jsontest: string;

  @config
  csstest: string;

  @config
  username: Credential.Text;

  @config
  password: Credential.Password;

  // NOTE: run only once when node type is registered
  static async init() {
    await fetch("https://google.com");
    console.log("fetched google");
  }

  // TODO: define msg type using TypeBox and JSON Schema
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
