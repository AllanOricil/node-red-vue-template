import type { Schema, Infer } from "@bonsae/nrg/server";
import { IONode, SchemaType } from "@bonsae/nrg/server";
import { ConfigsSchema } from "../schemas/http-request";

export type Config = Infer<typeof ConfigsSchema>;

export default class HttpRequest extends IONode<Config> {
  public static override readonly type: string = "http-request-custom";
  public static override readonly category: string = "network";
  public static override readonly color: `#${string}` = "#e8d44d";

  public static override readonly configSchema: Schema = ConfigsSchema;
  public static override readonly inputSchema: Schema = SchemaType.Object({});
  public static override readonly outputsSchema: Schema = SchemaType.Object({});

  public override async input(msg: any): Promise<void> {
    this.log(`${this.config.method} ${this.config.url}`);
    this.send(msg);
  }
}
