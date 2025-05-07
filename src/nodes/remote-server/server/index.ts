import {
  TIntersect,
  TObject,
  TOptional,
  TString,
  TUnion,
  TLiteral,
  TNumber,
  TUnknown,
} from "@sinclair/typebox";
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
} from "../../your-node/schemas";

type Configs = Static<typeof ConfigsSchema>;
type Credentials = Static<typeof CredentialsSchema>;
type InputMessage = Static<typeof InputMessageSchema>;
type OutputMessage = Static<typeof OutputMessageSchema>;

@node({
  validation: {
    configs: ConfigsSchema,
  },
})
export default class RemoteServerConfigNode extends Node<
  Configs,
  Credentials,
  InputMessage,
  OutputMessage
> {
  // NOTE: run only once when node type is registered
  static init() {
    console.log("server-node");
  }
}
