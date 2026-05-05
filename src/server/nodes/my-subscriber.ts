import { defineIONode } from "@bonsae/nrg/server";
import { ConfigsSchema, OutputSchema } from "../schemas/my-subscriber";

export default defineIONode({
  type: "my-subscriber",
  category: "network",
  color: "#d8bfd8",
  inputs: 0,
  outputs: 1,
  configSchema: ConfigsSchema,
  outputsSchema: OutputSchema,

  created() {
    this.log(`Class name: ${this.constructor.name}`);
    const broker = this.config.broker;
    if (broker?.config) {
      this.log(
        `Subscribing to ${this.config.topic} via ${broker.config.host}:${broker.config.port}`,
      );
      this.status({ fill: "green", shape: "dot", text: "connected" });
    } else {
      this.status({ fill: "red", shape: "dot", text: "no broker" });
    }
  },

  closed() {
    this.log("Unsubscribed");
    this.status({});
  },
});
