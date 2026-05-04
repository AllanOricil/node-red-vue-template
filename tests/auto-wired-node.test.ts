import { describe, it, expect } from "vitest";
import { createNode } from "@bonsae/nrg/test";
import AutoWiredNode from "../src/server/nodes/auto-wired-node";
import RemoteServer from "../src/server/nodes/remote-server";

describe("auto-wired-node", () => {
  it("should echo config and credentials as JSON", async () => {
    const { node: server } = await createNode(RemoteServer, {
      config: { host: "localhost" },
      overrides: { id: "server-1" },
    });

    const { node } = await createNode(AutoWiredNode, {
      config: { server: "server-1", url: "https://api.example.com" },
      configNodes: { "server-1": server },
    });

    await node.receive({ payload: "test" });

    expect(node.sent(0)).toHaveLength(1);
    const output = node.sent(0)[0];
    expect(output.statusCode).toBe(200);
    expect(output.body).toBeDefined();
  });

  it("should use default config values", async () => {
    const { node } = await createNode(AutoWiredNode);

    expect(node.config.url).toBe("https://api.example.com");
    expect(node.config.method).toBe("GET");
    expect(node.config.timeout).toBe(5000);
    expect(node.config.retries).toBe(0);
    expect(node.config.followRedirects).toBe(true);
    expect(node.config.verbose).toBe(false);
  });
});
