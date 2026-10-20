import { describe, expect, it } from "vitest";
import { DEFAULT_PREFS, parsePrefs } from "./prefs";
import { mockReply, titleFrom } from "./mock-ai";

describe("prefs", () => {
  it("sound is off by default (opt-in)", () => expect(DEFAULT_PREFS.sound).toBe(false));
  it("falls back on corrupt storage", () => expect(parsePrefs("{bad")).toEqual(DEFAULT_PREFS));
  it("rejects invalid accent and clamps volume", () => {
    const p = parsePrefs(JSON.stringify({ accent: "red", volume: 5 }));
    expect(p.accent).toBe("lime");
    expect(p.volume).toBe(1);
  });
});

describe("mock ai", () => {
  it("states no model is connected for generic prompts", () => expect(mockReply("hello there")).toContain("no AI model is connected"));
  it("truncates long titles to 40 chars", () => expect(titleFrom("a".repeat(60))).toHaveLength(41));
});
