import type { Schema, Infer } from "@bonsae/nrg/server";
import { IONode, type RED } from "@bonsae/nrg/server";
import {
  ConfigsSchema,
  CredentialsSchema,
  InputSchema,
  OutputSchema,
  SettingsSchema,
} from "../schemas/your-node";
import RemoteServerConfigNode from "./remote-server";

export type Config = Infer<typeof ConfigsSchema>;
export type Credentials = Infer<typeof CredentialsSchema>;
export type Input = Infer<typeof InputSchema>;
export type Output = Infer<typeof OutputSchema>;
export type Settings = Infer<typeof SettingsSchema>;

export default class YourNode extends IONode<
  Config,
  Credentials,
  Input,
  Output,
  Settings
> {
  public static override readonly type: string = "your-node";
  public static override readonly category: string = "function";
  public static override readonly color: `#${string}` = "#ffffff";
  public static override readonly inputs: number = 1;
  public static override readonly outputs: number = 1;

  public static override readonly configSchema: Schema = ConfigsSchema;
  public static override readonly credentialsSchema: Schema = CredentialsSchema;
  public static override readonly inputSchema: Schema = InputSchema;
  public static override readonly outputsSchema: Schema = OutputSchema;
  public static override readonly settingsSchema: Schema = SettingsSchema;

  public static override async registered(RED: RED): Promise<void> {
    try {
      RED.log.info(`Registering ${this.type}`);
      const response = await fetch("https://dog.ceo/api/breeds/image/random");
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      RED.log.info(json);

      RED.log.info(`${this.type} registered`);
    } catch (error) {
      if (error instanceof Error) {
        RED.log.error("Error while fetching dogs: ", error.message);
      } else {
        RED.log.error("Unknown error occurred: ", error);
      }
    }
  }

  public override created(): void {
    this.log(`YourNode ${this.id} - ${this.name} created!`);
    // NOTE: using internal interval because I don't want to have to manually clear it
    this.setInterval(() => {
      this.log("hello world");
    }, 1000);
  }

  public override async input(msg: Input): Promise<void> {
    // --- Test 1: Schema-driven node ref resolution ---
    // remoteServer has x-nrg-node-type so it should resolve to the config node instance
    const server = this.config.remoteServer;
    if (server instanceof RemoteServerConfigNode) {
      this.log(
        "[PASS] remoteServer resolved to RemoteServerConfigNode instance",
      );
    } else {
      this.warn("[FAIL] remoteServer was NOT resolved to a node instance");
    }

    // --- Test 2: Plain strings should NOT be resolved as node refs ---
    // name, country, number are plain strings — they must stay as strings
    const name = this.config.name;
    if (typeof name === "string") {
      this.log(`[PASS] config.name is a string: "${name}"`);
    } else {
      this.warn(
        `[FAIL] config.name was resolved as something else: ${typeof name}`,
      );
    }

    const country = this.config.country;
    if (typeof country === "string") {
      this.log(`[PASS] config.country is a string: "${country}"`);
    } else {
      this.warn(
        `[FAIL] config.country was resolved as something else: ${typeof country}`,
      );
    }

    // --- Test 3: Reference equality (WeakMap cache) ---
    const server1 = this.config.remoteServer;
    const server2 = this.config.remoteServer;
    if (server1 === server2) {
      this.log(
        "[PASS] config.remoteServer === config.remoteServer (identity preserved)",
      );
    } else {
      this.warn(
        "[FAIL] config.remoteServer !== config.remoteServer (identity broken)",
      );
    }

    // --- Test 4: Array identity ---
    const fruit1 = this.config.fruit;
    const fruit2 = this.config.fruit;
    if (fruit1 === fruit2) {
      this.log(
        "[PASS] config.fruit === config.fruit (array identity preserved)",
      );
    } else {
      this.warn("[FAIL] config.fruit !== config.fruit (array identity broken)");
    }

    // --- Test 5: Read-only config (set trap) ---
    try {
      (this.config as any).name = "should-fail";
      this.warn("[FAIL] config mutation did NOT throw");
    } catch (e: any) {
      this.log(`[PASS] config mutation threw: ${e.message}`);
    }

    // --- Test 6: TypedInput values should NOT be resolved as node refs ---
    const myProperty = this.config.myProperty;
    if (myProperty && typeof myProperty === "object" && "value" in myProperty) {
      this.log(
        `[PASS] config.myProperty is a TypedInput object: ${JSON.stringify(myProperty)}`,
      );
    } else {
      this.warn(`[FAIL] config.myProperty was unexpectedly resolved`);
    }

    // --- Test 7: Config node users ---
    const firstUser = server.users[0];
    if (firstUser instanceof YourNode) {
      this.log("[PASS] server.users[0] is a YourNode instance");
    }

    // --- Original functionality ---
    this.log(`credentials username: ${this.credentials?.username}`);
    console.log(`settings: ${this.settings.test}`);
    console.log(`transform function: ${this.settings.transform("FoO")}`);

    const outputMsg = {
      originalType: "number" as const,
      processedTime: 1,
      inputMsg: msg,
      settings: this.settings,
    };
    this.send(outputMsg as unknown as Output);
  }

  public override async closed(): Promise<void> {
    this.log(`Closed ${YourNode.type} - ${this.name}`);
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
}
