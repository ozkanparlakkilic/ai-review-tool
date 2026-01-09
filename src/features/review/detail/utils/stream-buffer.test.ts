import { describe, it, expect } from "vitest";
import { StreamBuffer } from "./stream-buffer";

describe("StreamBuffer", () => {
  it("appends and flushes content", () => {
    const buffer = new StreamBuffer();
    buffer.append("hello");
    buffer.append(" world");

    expect(buffer.current).toBe("hello world");
    expect(buffer.flush()).toBe("hello world");
    expect(buffer.current).toBe("");
  });

  it("returns empty string on empty flush", () => {
    const buffer = new StreamBuffer();
    expect(buffer.flush()).toBe("");
  });
});
