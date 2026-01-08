"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/shared/components/status-badge";
import { ReviewItem } from "@/shared/types";

interface ReviewTableProps {
  items: ReviewItem[];
  selectedIds?: Set<string>;
  onToggleRow?: (id: string) => void;
  onToggleAll?: (checked: boolean) => void;
  isAllSelected?: boolean;
  isSomeSelected?: boolean;
}

export function ReviewTable({
  items,
  selectedIds,
  onToggleRow,
  onToggleAll,
  isAllSelected,
  isSomeSelected,
}: ReviewTableProps) {
  const router = useRouter();
  const hasSelection = selectedIds !== undefined && onToggleRow !== undefined;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {hasSelection && (
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected || (isSomeSelected && "indeterminate")}
                  onCheckedChange={(checked) => onToggleAll?.(checked === true)}
                  aria-label="Select all"
                />
              </TableHead>
            )}
            <TableHead className="w-[50%]">Prompt</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              {hasSelection && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds?.has(item.id)}
                    onCheckedChange={() => onToggleRow?.(item.id)}
                    aria-label={`Select ${item.prompt}`}
                  />
                </TableCell>
              )}
              <TableCell className="font-medium">
                {truncateText(item.prompt)}
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(item.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  onClick={() => router.push(`/review/${item.id}`)}
                >
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
