import { describe, it, expect } from "vitest";
import { normalizeUzbekPhone, isValidUzbekPhone, formatUzbekPhoneMask } from "./phone";

describe("normalizeUzbekPhone", () => {
  it("accepts 9-digit national with no country code", () => {
    expect(normalizeUzbekPhone("901234567")).toBe("998901234567");
  });
  it("accepts +998 prefixed input with formatting", () => {
    expect(normalizeUzbekPhone("+998 (90) 123-45-67")).toBe("998901234567");
  });
  it("rejects a non-Uzbek number", () => {
    expect(() => normalizeUzbekPhone("+15551234567")).toThrow("INVALID_UZ_PHONE");
  });
  it("rejects garbage", () => {
    expect(isValidUzbekPhone("abc")).toBe(false);
  });
});

describe("formatUzbekPhoneMask", () => {
  it("partial input", () => {
    expect(formatUzbekPhoneMask("90")).toBe("+998 (90)");
  });
  it("full input", () => {
    expect(formatUzbekPhoneMask("901234567")).toBe("+998 (90) 123-45-67");
  });
});
