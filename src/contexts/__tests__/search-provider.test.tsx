import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, renderHook, act } from "@testing-library/react";
import { SearchProvider, useSearch } from "../search-provider";

describe("SearchProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render children", () => {
    render(
      <SearchProvider>
        <div>Test content</div>
      </SearchProvider>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should provide initial open state as false", () => {
    const { result } = renderHook(() => useSearch(), {
      wrapper: SearchProvider,
    });

    expect(result.current.open).toBe(false);
  });

  it("should allow setting open state", () => {
    const { result } = renderHook(() => useSearch(), {
      wrapper: SearchProvider,
    });

    act(() => {
      result.current.setOpen(true);
    });

    expect(result.current.open).toBe(true);
  });

  it("should toggle open state with setOpen", () => {
    const { result } = renderHook(() => useSearch(), {
      wrapper: SearchProvider,
    });

    act(() => {
      result.current.setOpen(true);
    });

    expect(result.current.open).toBe(true);

    act(() => {
      result.current.setOpen(false);
    });

    expect(result.current.open).toBe(false);
  });

  it("should toggle open state when Cmd+K is pressed", () => {
    const { result } = renderHook(() => useSearch(), {
      wrapper: SearchProvider,
    });

    expect(result.current.open).toBe(false);

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      ctrlKey: false,
    });

    act(() => {
      document.dispatchEvent(event);
    });

    expect(result.current.open).toBe(true);

    act(() => {
      document.dispatchEvent(event);
    });

    expect(result.current.open).toBe(false);
  });

  it("should toggle open state when Ctrl+K is pressed", () => {
    const { result } = renderHook(() => useSearch(), {
      wrapper: SearchProvider,
    });

    expect(result.current.open).toBe(false);

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: false,
      ctrlKey: true,
    });

    act(() => {
      document.dispatchEvent(event);
    });

    expect(result.current.open).toBe(true);
  });

  it("should not toggle when K is pressed without modifiers", () => {
    const { result } = renderHook(() => useSearch(), {
      wrapper: SearchProvider,
    });

    expect(result.current.open).toBe(false);

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: false,
      ctrlKey: false,
    });

    act(() => {
      document.dispatchEvent(event);
    });

    expect(result.current.open).toBe(false);
  });

  it("should not toggle when Cmd is pressed with different key", () => {
    const { result } = renderHook(() => useSearch(), {
      wrapper: SearchProvider,
    });

    expect(result.current.open).toBe(false);

    const event = new KeyboardEvent("keydown", {
      key: "j",
      metaKey: true,
      ctrlKey: false,
    });

    act(() => {
      document.dispatchEvent(event);
    });

    expect(result.current.open).toBe(false);
  });

  it("should prevent default when Cmd+K is pressed", () => {
    const preventDefaultSpy = vi.fn();
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      ctrlKey: false,
    });
    event.preventDefault = preventDefaultSpy;

    render(<SearchProvider><div>Test</div></SearchProvider>);

    act(() => {
      document.dispatchEvent(event);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("should prevent default when Ctrl+K is pressed", () => {
    const preventDefaultSpy = vi.fn();
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: false,
      ctrlKey: true,
    });
    event.preventDefault = preventDefaultSpy;

    render(<SearchProvider><div>Test</div></SearchProvider>);

    act(() => {
      document.dispatchEvent(event);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("should clean up event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = render(
      <SearchProvider>
        <div>Test</div>
      </SearchProvider>
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });
});

describe("useSearch", () => {
  it("should return context when used within SearchProvider", () => {
    const { result } = renderHook(() => useSearch(), {
      wrapper: SearchProvider,
    });

    expect(result.current).toHaveProperty("open");
    expect(result.current).toHaveProperty("setOpen");
    expect(typeof result.current.setOpen).toBe("function");
  });

  it("should throw error when used outside SearchProvider", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      renderHook(() => useSearch());
    }).toThrow("useSearch must be used within a SearchProvider");

    consoleErrorSpy.mockRestore();
  });
});

