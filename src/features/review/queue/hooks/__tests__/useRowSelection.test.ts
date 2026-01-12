import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRowSelection } from "../useRowSelection";

describe("useRowSelection", () => {
  it("should initialize with empty selection", () => {
    const { result } = renderHook(() => useRowSelection());

    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.selectedIds).toEqual(new Set());
  });

  it("should toggle row selection", () => {
    const { result } = renderHook(() => useRowSelection());

    act(() => {
      result.current.toggleRow("1");
    });

    expect(result.current.isSelected("1")).toBe(true);
    expect(result.current.selectedCount).toBe(1);

    act(() => {
      result.current.toggleRow("1");
    });

    expect(result.current.isSelected("1")).toBe(false);
    expect(result.current.selectedCount).toBe(0);
  });

  it("should toggle multiple rows", () => {
    const { result } = renderHook(() => useRowSelection());

    act(() => {
      result.current.toggleRow("1");
      result.current.toggleRow("2");
      result.current.toggleRow("3");
    });

    expect(result.current.isSelected("1")).toBe(true);
    expect(result.current.isSelected("2")).toBe(true);
    expect(result.current.isSelected("3")).toBe(true);
    expect(result.current.selectedCount).toBe(3);

    act(() => {
      result.current.toggleRow("2");
    });

    expect(result.current.isSelected("1")).toBe(true);
    expect(result.current.isSelected("2")).toBe(false);
    expect(result.current.isSelected("3")).toBe(true);
    expect(result.current.selectedCount).toBe(2);
  });

  it("should toggle all rows when checked", () => {
    const { result } = renderHook(() => useRowSelection());

    const allIds = ["1", "2", "3"];

    act(() => {
      result.current.toggleAll(allIds, true);
    });

    expect(result.current.isAllSelected(allIds)).toBe(true);
    expect(result.current.selectedCount).toBe(3);
    expect(result.current.isSelected("1")).toBe(true);
    expect(result.current.isSelected("2")).toBe(true);
    expect(result.current.isSelected("3")).toBe(true);
  });

  it("should clear all selections when toggleAll with checked false", () => {
    const { result } = renderHook(() => useRowSelection());

    const allIds = ["1", "2", "3"];

    act(() => {
      result.current.toggleAll(allIds, true);
      result.current.toggleAll(allIds, false);
    });

    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isAllSelected(allIds)).toBe(false);
    expect(result.current.isSomeSelected(allIds)).toBe(false);
  });

  it("should clear selection", () => {
    const { result } = renderHook(() => useRowSelection());

    act(() => {
      result.current.toggleRow("1");
      result.current.toggleRow("2");
    });

    expect(result.current.selectedCount).toBe(2);

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isSelected("1")).toBe(false);
    expect(result.current.isSelected("2")).toBe(false);
  });

  it("should return false for isAllSelected when no rows provided", () => {
    const { result } = renderHook(() => useRowSelection());

    expect(result.current.isAllSelected([])).toBe(false);
  });

  it("should return false for isSomeSelected when no rows provided", () => {
    const { result } = renderHook(() => useRowSelection());

    expect(result.current.isSomeSelected([])).toBe(false);
  });

  it("should return true for isAllSelected when all rows are selected", () => {
    const { result } = renderHook(() => useRowSelection());

    const allIds = ["1", "2", "3"];

    act(() => {
      result.current.toggleAll(allIds, true);
    });

    expect(result.current.isAllSelected(allIds)).toBe(true);
    expect(result.current.isSomeSelected(allIds)).toBe(false);
  });

  it("should return true for isSomeSelected when some but not all rows are selected", () => {
    const { result } = renderHook(() => useRowSelection());

    const allIds = ["1", "2", "3"];

    act(() => {
      result.current.toggleRow("1");
      result.current.toggleRow("2");
    });

    expect(result.current.isSomeSelected(allIds)).toBe(true);
    expect(result.current.isAllSelected(allIds)).toBe(false);
  });

  it("should return false for isSomeSelected when no rows are selected", () => {
    const { result } = renderHook(() => useRowSelection());

    const allIds = ["1", "2", "3"];

    expect(result.current.isSomeSelected(allIds)).toBe(false);
    expect(result.current.isAllSelected(allIds)).toBe(false);
  });

  it("should return false for isSomeSelected when all rows are selected", () => {
    const { result } = renderHook(() => useRowSelection());

    const allIds = ["1", "2", "3"];

    act(() => {
      result.current.toggleAll(allIds, true);
    });

    expect(result.current.isSomeSelected(allIds)).toBe(false);
    expect(result.current.isAllSelected(allIds)).toBe(true);
  });

  it("should handle large number of selections", () => {
    const { result } = renderHook(() => useRowSelection());

    const largeIds = Array.from({ length: 100 }, (_, i) => `${i + 1}`);

    act(() => {
      result.current.toggleAll(largeIds, true);
    });

    expect(result.current.selectedCount).toBe(100);
    expect(result.current.isAllSelected(largeIds)).toBe(true);

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedCount).toBe(0);
  });

  it("should handle rapid toggling", () => {
    const { result } = renderHook(() => useRowSelection());

    act(() => {
      result.current.toggleRow("1");
      result.current.toggleRow("1");
      result.current.toggleRow("1");
      result.current.toggleRow("2");
    });

    expect(result.current.isSelected("1")).toBe(true);
    expect(result.current.isSelected("2")).toBe(true);
    expect(result.current.selectedCount).toBe(2);
  });

  it("should maintain selection state across re-renders", () => {
    const { result, rerender } = renderHook(() => useRowSelection());

    act(() => {
      result.current.toggleRow("1");
    });

    expect(result.current.selectedCount).toBe(1);

    rerender();

    expect(result.current.selectedCount).toBe(1);
    expect(result.current.isSelected("1")).toBe(true);
  });
});
