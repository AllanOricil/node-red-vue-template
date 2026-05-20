import type { Schema, Infer } from "@bonsae/nrg/server";
import { IONode } from "@bonsae/nrg/server";
import {
  ConfigsSchema,
  InputSchema,
  Output1Schema,
  Output2Schema,
} from "../schemas/splitter";

export type Config = Infer<typeof ConfigsSchema>;
export type Input = Infer<typeof InputSchema>;
export type Output1 = Infer<typeof Output1Schema>;
export type Output2 = Infer<typeof Output2Schema>;

export default class Splitter extends IONode<Config> {
  public static override readonly type: string = "splitter";
  public static override readonly category: string = "function";
  public static override readonly color: `#${string}` = "#c2e5a0";
  public static override readonly configSchema: Schema = ConfigsSchema;
  public static override readonly inputSchema: Schema = InputSchema;
  public static override readonly outputsSchema = {
    above: Output1Schema,
    below: Output2Schema,
  };

  public override async input(msg: Input): Promise<void> {
    const value = msg.payload;
    const threshold = this.config.threshold;

    if (value >= threshold) {
      this.sendToPort("above", { payload: value, label: "above" });
    } else {
      this.sendToPort("below", { payload: value, label: "below" });
    }
  }
}
