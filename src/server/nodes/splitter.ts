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

type Output = [Output1 | null, Output2 | null];

export default class Splitter extends IONode<Config, any, Input, Output> {
  public static override readonly type: string = "splitter";
  public static override readonly category: string = "function";
  public static override readonly color: `#${string}` = "#c2e5a0";
  public static override readonly inputs: number = 1;
  public static override readonly outputs: number = 2;

  public static override readonly configSchema: Schema = ConfigsSchema;
  public static override readonly inputSchema: Schema = InputSchema;
  public static override readonly outputsSchema: Schema[] = [
    Output1Schema,
    Output2Schema,
  ];

  public override async input(msg: Input): Promise<void> {
    const value = msg.payload;
    const threshold = this.config.threshold;

    if (value >= threshold) {
      this.send([{ payload: value, label: "above" }, null]);
    } else {
      this.send([null, { payload: value, label: "below" }]);
    }
  }
}
