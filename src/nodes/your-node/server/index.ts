import { Static } from "@sinclair/typebox";
import { node } from "../../../core/server/decorators";
import {
  InputDoneFunction,
  Node,
  SendFunction,
} from "../../../core/server/node";
import {
  ConfigsSchema,
  CredentialsSchema,
  InputMessageSchema,
  OutputMessageSchema,
} from "../schemas";
import RemoteServerConfigNode from "../../remote-server/server";

type Configs = Static<typeof ConfigsSchema>;
type Credentials = Static<typeof CredentialsSchema>;
type InputMessage = Static<typeof InputMessageSchema>;
type OutputMessage = Static<typeof OutputMessageSchema>;

@node({
  validation: {
    configs: ConfigsSchema,
    credentials: CredentialsSchema,
    input: InputMessageSchema,
    outputs: OutputMessageSchema,
  },
})
export default class YourNode extends Node<
  Configs,
  Credentials,
  InputMessage,
  OutputMessage
> {
  static override async init() {
    console.log("testing your node init");
  }

  async onInput(
    msg: {
      payload?: string | undefined;
      topic?: string | undefined;
      _msgid?: string | undefined;
    } & { myVariable?: string | undefined },
    send: SendFunction<
      {
        payload?: string | undefined;
        topic?: string | undefined;
        _msgid?: string | undefined;
      } & { originalType: "string" | "number"; processedTime: number }
    >,
    done: InputDoneFunction
  ): void | Promise<void> {
    console.log(this);
    console.log(msg);

    const server = Node.getNode<RemoteServerConfigNode>(
      this.configs.remoteServer
    );
    console.log(server?.users);
  }

  async onClose(
    removed: boolean,
    done: CloseDoneFunction
  ): void | Promise<void> {
    console.log("removing node");
    done();
  }
}
