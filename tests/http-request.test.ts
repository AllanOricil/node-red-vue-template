import { describe, it, expect } from "vitest";
import { createNode } from "@bonsae/nrg/test";
import HttpRequest from "../src/server/nodes/http-request";

describe("http-request-custom", () => {
  it("should log method and url on input", async () => {
    const { node } = await createNode(HttpRequest, {
      config: { method: "POST", url: "https://api.example.com/data" },
    });

    await node.receive({ payload: "test" });

    expect(node.logged("info")).toContain(
      "POST https://api.example.com/data",
    );
  });

  it("should pass message through", async () => {
    const { node } = await createNode(HttpRequest, {
      config: { method: "GET", url: "https://example.com" },
    });

    await node.receive({ payload: "hello" });

    expect(node.sent(0)).toHaveLength(1);
  });

  it("should use default method GET", async () => {
    const { node } = await createNode(HttpRequest);

    expect(node.config.method).toBe("GET");
  });
});
