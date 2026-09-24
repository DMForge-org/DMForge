import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn", () => {
  it("merges tailwind classes correctly", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("handles conditional classes", () => {
    const result = cn("p-4", false && "m-4", "flex");
    expect(result).toBe("p-4 flex");
  });
});
