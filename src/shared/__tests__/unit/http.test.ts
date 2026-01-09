import { describe, it, expect, vi, beforeEach } from "vitest";
import { http, HttpError } from "@/shared/services/http";

describe("http", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("makes a successful GET request", async () => {
    const mockData = { foo: "bar" };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await http("/test");

    expect(fetch).toHaveBeenCalledWith("/api/test", expect.any(Object));
    expect(result).toEqual(mockData);
  });

  it("throws HttpError on non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: async () => ({ message: "Not Found" }),
    } as Response);

    await expect(http("/test")).rejects.toThrow(HttpError);
  });

  it("handles custom options", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    await http("/test", { method: "POST", body: JSON.stringify({ a: 1 }) });

    expect(fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ a: 1 }),
      })
    );
  });
});
