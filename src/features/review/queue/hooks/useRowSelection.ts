import { useState, useCallback, useEffect } from "react";

export function useRowSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback((ids: string[], checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(ids));
    } else {
      setSelectedIds(new Set());
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const isAllSelected = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return false;
      return ids.every((id) => selectedIds.has(id));
    },
    [selectedIds]
  );

  const isSomeSelected = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return false;
      return ids.some((id) => selectedIds.has(id)) && !isAllSelected(ids);
    },
    [selectedIds, isAllSelected]
  );

  useEffect(() => {
    return () => {
      setSelectedIds(new Set());
    };
  }, []);

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    toggleRow,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isSomeSelected,
  };
}
