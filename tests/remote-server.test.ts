import { describe, it, expect } from "vitest";
import { createNode } from "@bonsae/nrg/test";
import RemoteServer from "../src/server/nodes/remote-server";

describe("remote-server", () => {
  it("should create with default config", async () => {
    const { node } = await createNode(RemoteServer);

    expect(node.config.host).toBe("localhost");
  });

  it("should accept custom host", async () => {
    const { node } = await createNode(RemoteServer, {
      config: { host: "production.example.com" },
    });

    expect(node.config.host).toBe("production.example.com");
  });
});
