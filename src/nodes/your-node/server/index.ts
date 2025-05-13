import { Static } from "@sinclair/typebox";
import {
  CloseDoneFunction,
  InputDoneFunction,
  IONode,
  IONodeValidations,
  SendFunction,
} from "../../../core/server/nodes";
import RemoteServerConfigNode from "../../remote-server/server";
import {
  ConfigsSchema,
  CredentialsSchema,
  InputMessageSchema,
  OutputMessageSchema,
} from "../schemas";

export type YourNodeConfigs = Static<typeof ConfigsSchema>;
export type YourNodeCredentials = Static<typeof CredentialsSchema>;
export type YourNodeInputMessage = Static<typeof InputMessageSchema>;
export type YourNodeOutputMessage = Static<typeof OutputMessageSchema>;

export default class YourNode extends IONode<
  YourNodeConfigs,
  YourNodeCredentials,
  YourNodeInputMessage,
  YourNodeOutputMessage
> {
  static override validations: IONodeValidations = {
    configs: ConfigsSchema,
    credentials: CredentialsSchema,
    input: InputMessageSchema,
    outputs: OutputMessageSchema,
  };

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
  ): Promise<void> {
    console.log(this);
    console.log(msg);

    const server = IONode.getNode<RemoteServerConfigNode>(
      this.configs.remoteServer
    );
    console.log(server?.users);

    const outputMsg: YourNodeOutputMessage = {
      originalType: "number",
      processedTime: 1,
    };
    send(outputMsg);
    done();
  }

  async onClose(removed: boolean, done: CloseDoneFunction): Promise<void> {
    console.log("removing node");
    done();
  }
}
