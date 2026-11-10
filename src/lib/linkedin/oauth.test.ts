import { describe, expect, it } from "vitest";
import { openImportPayload, sealImportPayload } from "./oauth";

describe("LinkedIn import cookie seal", () => {
  it("round-trips a payload with HMAC verification", () => {
    const sealed = sealImportPayload({ name: "Ada Lovelace", picture: "https://example.com/a.png" }, "test-secret");
    const opened = openImportPayload(sealed, "test-secret");
    expect(opened?.name).toBe("Ada Lovelace");
    expect(opened?.picture).toBe("https://example.com/a.png");
  });

  it("rejects a tampered signature", () => {
    const sealed = sealImportPayload({ name: "Ada" }, "test-secret");
    const [json] = sealed.split(".");
    expect(openImportPayload(`${json}.deadbeef`, "test-secret")).toBeNull();
    expect(openImportPayload(sealed, "other-secret")).toBeNull();
  });
});
