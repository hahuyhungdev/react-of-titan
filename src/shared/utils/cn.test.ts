import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy class names and filters empty values", () => {
    expect(cn("btn", false, "btn-primary", null, undefined, "active")).toBe(
      "btn btn-primary active",
    );
  });
});
