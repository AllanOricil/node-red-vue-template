import { Static } from "@sinclair/typebox";
import {
  ConfigNode,
  ConfigNodeValidations,
  CloseDoneFunction,
} from "../../core/server/nodes";
import { ConfigsSchema } from "../../schemas/remote-server";

export type RemoteServerConfigs = Static<typeof ConfigsSchema>;

export default class RemoteServerConfigNode extends ConfigNode<RemoteServerConfigs> {
  static override validations: ConfigNodeValidations = {
    configs: ConfigsSchema,
  };

  // NOTE: run only once when node type is registered
  static override async init() {
    console.log("testing remote-server node init");

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

  override onClose(): void | Promise<void> {
    console.log("closing remote server");
  }
}
