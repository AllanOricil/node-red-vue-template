import { describe, it, expect } from "vitest";
import { createNode } from "@bonsae/nrg/test";
import MyBroker from "../src/server/nodes/my-broker";
import MySubscriber from "../src/server/nodes/my-subscriber";

describe("my-subscriber", () => {
  it("should set green status when broker is available", async () => {
    const { node: broker } = await createNode(MyBroker, {
      config: { host: "localhost", port: 1883 },
      overrides: { id: "broker-1" },
    });

    const { node } = await createNode(MySubscriber, {
      config: { broker: "broker-1", topic: "test/topic", qos: 0 },
      configNodes: { "broker-1": broker },
    });

    expect(node.statuses()).toContainEqual({
      fill: "green",
      shape: "dot",
      text: "connected",
    });
  });

  it("should set red status when broker is not available", async () => {
    const { node } = await createNode(MySubscriber, {
      config: { topic: "test/topic", qos: 0 },
    });

    expect(node.statuses()).toContainEqual({
      fill: "red",
      shape: "dot",
      text: "no broker",
    });
  });

  it("should clear status on close", async () => {
    const { node } = await createNode(MySubscriber);

    node.reset();
    await node.close();

    expect(node.statuses()).toContainEqual({});
  });

  it("should use default topic and qos", async () => {
    const { node } = await createNode(MySubscriber);

    expect(node.config.topic).toBe("test/topic");
    expect(node.config.qos).toBe(0);
  });
});
