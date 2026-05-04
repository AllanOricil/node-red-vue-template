import { describe, it, expect } from "vitest";
import { createNode } from "@bonsae/nrg/test";
import MyBroker from "../src/server/nodes/my-broker";

describe("my-broker", () => {
  it("should create with default config", async () => {
    const { node } = await createNode(MyBroker);

    expect(node.config.host).toBe("localhost");
    expect(node.config.port).toBe(1883);
    expect(node.config.useTls).toBe(false);
  });

  it("should log connection details on created", async () => {
    const { node } = await createNode(MyBroker, {
      config: { host: "broker.example.com", port: 8883, useTls: true },
    });

    expect(node.logged("info")).toContain(
      "My Broker: broker.example.com:8883 (TLS: true)",
    );
  });

  it("should log disconnection on close", async () => {
    const { node } = await createNode(MyBroker);

    await node.close();

    expect(node.logged("info")).toContain("My Broker disconnected");
  });
});
