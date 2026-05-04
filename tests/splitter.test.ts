import { describe, it, expect } from "vitest";
import { createNode } from "@bonsae/nrg/test";
import Splitter from "../src/server/nodes/splitter";

describe("splitter", () => {
  it("should route above-threshold values to port 0", async () => {
    const { node } = await createNode(Splitter, {
      config: { threshold: 50 },
    });

    await node.receive({ payload: 75 });

    expect(node.sent(0)).toHaveLength(1);
    expect(node.sent(0)[0]).toMatchObject({ payload: 75, label: "above" });
    expect(node.sent(1)).toHaveLength(0);
  });

  it("should route below-threshold values to port 1", async () => {
    const { node } = await createNode(Splitter, {
      config: { threshold: 50 },
    });

    await node.receive({ payload: 30 });

    expect(node.sent(0)).toHaveLength(0);
    expect(node.sent(1)).toHaveLength(1);
    expect(node.sent(1)[0]).toMatchObject({ payload: 30, label: "below" });
  });

  it("should route equal-to-threshold values to port 0 (above)", async () => {
    const { node } = await createNode(Splitter, {
      config: { threshold: 50 },
    });

    await node.receive({ payload: 50 });

    expect(node.sent(0)).toHaveLength(1);
    expect(node.sent(0)[0]).toMatchObject({ payload: 50, label: "above" });
    expect(node.sent(1)).toHaveLength(0);
  });

  it("should use default threshold of 50", async () => {
    const { node } = await createNode(Splitter);

    await node.receive({ payload: 100 });
    expect(node.sent(0)).toHaveLength(1);
  });
});
