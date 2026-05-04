import { describe, it, expect } from "vitest";
import { createNode } from "@bonsae/nrg/test";
import DynamicOutputs from "../src/server/nodes/dynamic-outputs";

describe("dynamic-outputs", () => {
  it("should broadcast message to all outputs", async () => {
    const { node } = await createNode(DynamicOutputs, {
      config: { outputs: 3, routingMode: "broadcast" },
    });

    await node.receive({ payload: "hello" });

    const raw = node.sent();
    expect(raw).toHaveLength(1);
    expect(raw[0]).toHaveLength(3);
    expect(raw[0][0]).toEqual({ payload: "hello" });
    expect(raw[0][1]).toEqual({ payload: "hello" });
    expect(raw[0][2]).toEqual({ payload: "hello" });
  });

  it("should send message through in round-robin mode (placeholder)", async () => {
    const { node } = await createNode(DynamicOutputs, {
      config: { outputs: 2, routingMode: "round-robin" },
    });

    await node.receive({ payload: "a" });

    // round-robin is a placeholder — just sends the message through
    expect(node.sent()).toHaveLength(1);
  });

  it("should default to 1 output", async () => {
    const { node } = await createNode(DynamicOutputs);

    expect(node.config.outputs).toBe(1);
  });
});
