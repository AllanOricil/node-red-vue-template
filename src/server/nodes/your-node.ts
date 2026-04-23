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
    const server = this.config.remoteServer;
    if (server instanceof RemoteServerConfigNode) {
      this.log("server is an instance of RemoteServerConfigNode");
    }

    await this.context.node.set("server", server);
    await this.context.flow.set("abc", server);
    await this.context.global.set("abc", server);
    await this.context.global.set("foo", "bar");
    await this.context("node", "file").set("foo", "bar");
    console.log(await this.context("node", "file").get("foo"));
    console.log(await this.context.node.keys());

    const server2 =
      await this.context.node.get<RemoteServerConfigNode>("server");
    if (server2 instanceof RemoteServerConfigNode) {
      this.log("server2 is an instance of RemoteServerConfigNode");
    }

    const server3 = (await this.context.node.get(
      "server",
    )) as RemoteServerConfigNode;
    if (server3 instanceof RemoteServerConfigNode) {
      this.log("server3 is an instance of RemoteServerConfigNode");
    }

    // NOTE: testing server side access to labels with placeholders
    console.log(this.i18n("errors.invalid", { field: "name" }));

    const firstUser = server.users[0];
    if (firstUser instanceof YourNode) {
      this.log("firstUser is an instance of YourNode");
    }

    // NOTE: testing typed inputs that can be resolved to another node reference
    const myProperty = await this.resolveTypedInput<YourNode>(
      this.config.myProperty,
    );
    if (myProperty instanceof YourNode) {
      this.log("myProperty is an instance of YourNode");
      console.log(`myProperty: ${myProperty.config.remoteServer}`);
      if (myProperty.config.remoteServer instanceof RemoteServerConfigNode) {
        this.log(
          "myProperty.config.remoteServer  is an instance of RemoteServerConfigNode",
        );
      }
    }

    const myProperty2 = await this.resolveTypedInput<string>(
      this.config.myProperty2,
    );
    console.log(`myProperty2: ${myProperty2}`);

    // NOTE: to avoid mem duplication, this.settings is a reference to settings that were resolved during validation
    // NOTE: testing settings. It should return the value from settings.ts or the default one from the schema
    console.log(`settings: ${this.settings.test}`);

    // NOTE: testing settings with functions
    console.log(`transform function: ${this.settings.transform("FoO")}`);

    const outputMsg = {
      originalType: "number" as const,
      processedTime: 1,
      inputMsg: msg,
      serverId: server.config.id,
      server: server,
      serverUserIds: server.userIds,
      serverUsers: server.users,
      self: this,
      settings: this.settings,
    };
    this.send(outputMsg as unknown as Output);
  }

  public override async closed(): Promise<void> {
    this.log(`Closed ${YourNode.type} - ${this.name}`);
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
}
