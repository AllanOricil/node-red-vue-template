import { input, node } from "./decorators";
import { RemoteServerConfigNode } from "./_server";
import { Node } from "./node";
import { TypedInput } from "./typed-input";
import * as Credential from "./credential";
import InputsSchema from "./inputs-schema";
import MessageSchema from "./message-schema";

@node({
  type: "your-node",
  category: "function",
  color: "#000000",
  inputs: 1,
  outputs: 1,
  icon: "node.svg",
  validation: {
    inputs: InputsSchema,
    message: MessageSchema,
  },
})
export class YourNode extends Node {
  @input({
    type: "typed:str",
    default: "abc",
    required: true,
    validation: function (value) {
      return value > 10;
    },
  })
  #myProperty;

  @input({
    type: "config:remote-server",
    required: true,
    validation: function (value) {
      return value > 10;
    },
  })
  #remoteServer;

  @input({
    type: "select:string"
    default: "abc",
    required: true,
  })
  #fruit;

  @input({
    type: "multi-select:string"
    default: "abc",
    required: true,
  })
  #country;

  @input({
    type: "string",
    default: "abc",
    required: true,
  })
  #number;

  @input({
    type: "string",
    default: "abc",
    required: true,
  })
  #object;

  @input({
    type: "string",
    default: ["a", "b", "c"],
    required: true,
  })
  #array;

  @input({
    type: "editor:string",
    default: "abc",
    required: true,
  })
  #jsontest;

  @input({
    type: "editor:string",
    default: "abc",
    required: true,
  })
  #csstest;

  @input({
    type: "credential:text",
    required: true,
  })
  #username;

  @input({
    type: "credential:password",
    required: true,
  })
  #password;

  // NOTE: run only once when node type is registered
  static async init() {
    await fetch("https://google.com");
    console.log("fetched google");
  }

  async onInput(msg, send, done) {
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
