import type { Schema, Infer } from "@bonsae/nrg/server";
import { IONode, type RED } from "@bonsae/nrg/server";
import {
  ConfigsSchema,
  CredentialsSchema,
  InputSchema,
  OutputSchema,
  SettingsSchema,
} from "../schemas/your-node";
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
  public static override readonly description =
    "Example node demonstrating NodeRef resolution, TypedInput, credentials, settings, and all lifecycle hooks.";
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
    // --- NodeRef: resolves config node ID to the actual node instance ---
    const server = this.config.remoteServer;
    this.log(`Remote server name: ${server?.config?.name}`);

    // --- NodeRef: plain strings are NOT resolved as node refs ---
    const name = this.config.name;
    if (typeof name === "string") {
      this.log(`config.name is a plain string: "${name}"`);
    }

    // --- NodeRef: reference equality is preserved (cached) ---
    this.log(
      `Same reference: ${this.config.remoteServer === this.config.remoteServer}`,
    );

    // --- NodeRef: config node users ---
    if (server?.users?.length) {
      this.log(`Server has ${server.users.length} user(s)`);
    }

    // --- TypedInput: resolves values via Node-RED's evaluateNodeProperty ---
    // resolve() return type is inferred from SchemaType.TypedInput<T>()
    const myProperty = this.config.myProperty;
    this.log(`TypedInput type: ${myProperty.type}, value: ${myProperty.value}`);
    const resolved = await myProperty.resolve(msg);
    this.log(`myProperty resolved: node ${resolved.id} (${resolved.name})`);

    const resolved2 = await this.config.myProperty2.resolve(msg);
    this.log(`myProperty2 resolved: ${resolved2}`);

    // --- Plain config values stay as-is ---
    this.log(`Name: ${this.config.name}`);
    this.log(`Country: ${this.config.country}`);
    this.log(`Fruit: ${this.config.fruit.join(", ")}`);

    // --- Array identity is preserved (cached) ---
    this.log(`Array stable: ${this.config.fruit === this.config.fruit}`);

    // --- Config is read-only ---
    try {
      (this.config as any).name = "fail";
    } catch {
      this.log("Config is immutable (set trap works)");
    }

    // --- Credentials ---
    this.log(`Username: ${this.credentials?.username}`);

    // --- Settings (validated at startup) ---
    this.log(`Setting test: ${this.settings.test}`);
    this.log(`Transform: ${this.settings.transform("FoO")}`);

    // --- Send output ---
    this.send({
      originalType: "number",
      processedTime: Date.now(),
    });
  }

  public override async closed(): Promise<void> {
    this.log(`Closed ${YourNode.type} - ${this.name}`);
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
}
