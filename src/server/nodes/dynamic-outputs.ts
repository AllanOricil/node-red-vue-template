import type { Schema, Infer } from "@bonsae/nrg/server";
import { IONode } from "@bonsae/nrg/server";
import { ConfigsSchema } from "../schemas/dynamic-outputs";

export type Config = Infer<typeof ConfigsSchema>;

export default class DynamicOutputs extends IONode<Config> {
  public static override readonly type: string = "dynamic-outputs";
  public static override readonly category: string = "function";
  public static override readonly color: `#${string}` = "#e2d96e";
  public static override readonly inputs: number = 1;
  public static override readonly outputs: number = 1;

  public static override readonly configSchema: Schema = ConfigsSchema;

  public override async input(msg: any): Promise<void> {
    const outputCount = this.config.outputs;
    const mode = this.config.routingMode;

    if (mode === "broadcast") {
      // Send to all outputs
      const msgs = Array.from({ length: outputCount }, () => msg);
      this.send(msgs as any);
    } else if (mode === "round-robin") {
      // Send to one output at a time (placeholder)
      this.send(msg);
    } else {
      this.send(msg);
    }
  }
}
