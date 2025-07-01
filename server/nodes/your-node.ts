import { Static } from "@sinclair/typebox";
import {
  CloseDoneFunction,
  InputDoneFunction,
  IONode,
  IONodeValidations,
  SendFunction,
} from "../../core/server/nodes";
import RemoteServerConfigNode from "./remote-server";
import {
  ConfigsSchema,
  CredentialsSchema,
  InputMessageSchema,
  OutputMessageSchema,
} from "../../schemas/your-node";

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
    console.log("testing your-node node init");

    try {
      const response = await fetch("https://dog.ceo/api/breeds/image/random");
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      console.log(json);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error while fetching dogs: ", error.message);
      } else {
        console.error("Unknown error occurred: ", error);
      }
    }
  }

  override async onInput(
    msg: {
      payload?: string | undefined;
      topic?: string | undefined;
      _msgid?: string | undefined;
      myVariable?: string | undefined;
    },
    send: SendFunction<{
      payload?: string | undefined;
      topic?: string | undefined;
      _msgid?: string | undefined;
      originalType: "string" | "number";
      processedTime: number;
    }>,
    done: InputDoneFunction,
  ): Promise<void> {
    console.log(this);
    console.log(msg);

    const server = IONode.getNode<RemoteServerConfigNode>(
      this.configs.remoteServer,
    );
    console.log(server);

    const outputMsg: YourNodeOutputMessage = {
      originalType: "number",
      processedTime: 1,
    };
    send(outputMsg);
    done();
  }

  override async onClose(
    removed: boolean,
    done: CloseDoneFunction,
  ): Promise<void> {
    console.log("removing node");
    console.log(removed);
    done();
  }
}
