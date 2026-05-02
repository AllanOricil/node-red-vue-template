import { defineConfigNode } from "@bonsae/nrg/server";
import { ConfigsSchema, CredentialsSchema } from "../schemas/my-broker";

export default defineConfigNode({
  type: "my-broker",
  description:
    "Configuration node for a message broker connection with host, port, and TLS settings.",
  configSchema: ConfigsSchema,
  credentialsSchema: CredentialsSchema,

  created() {
    this.log(`Class name: ${this.constructor.name}`);
    this.log(
      `My Broker: ${this.config.host}:${this.config.port} (TLS: ${this.config.useTls})`,
    );
  },

  closed() {
    this.log("My Broker disconnected");
  },
});
