import type { Schema, Infer } from "@bonsae/nrg/server";
import { IONode } from "@bonsae/nrg/server";
import {
  ConfigsSchema,
  CredentialsSchema,
  InputSchema,
  OutputSchema,
} from "../schemas/auto-wired-node";

export type Config = Infer<typeof ConfigsSchema>;
export type Credentials = Infer<typeof CredentialsSchema>;
export type Input = Infer<typeof InputSchema>;
export type Output = Infer<typeof OutputSchema>;

export default class AutoWiredNode extends IONode<
  Config,
  Credentials,
  Input,
  Output
> {
  public static override readonly type: string = "auto-wired-node";
  public static override readonly category: string = "network";
  public static override readonly color: `#${string}` = "#7fc7ff";
  public static override readonly inputs: number = 1;
  public static override readonly outputs: number = 1;

  public static override readonly configSchema: Schema = ConfigsSchema;
  public static override readonly credentialsSchema: Schema = CredentialsSchema;
  public static override readonly inputSchema: Schema = InputSchema;
  public static override readonly outputsSchema: Schema = OutputSchema;

  public override async input(msg: Input): Promise<void> {
    this.log(`Processing ${this.config.method} ${this.config.url}`);
    this.send({ statusCode: 200, body: msg.payload ?? "" });
  }
}
