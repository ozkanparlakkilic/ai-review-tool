"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ActivityLog, ActivityAction } from "@/shared/types/activity-log";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";

interface ActivityLogTableProps {
  data: ActivityLog[];
  isLoading: boolean;
}

const columns: ColumnDef<ActivityLog>[] = [
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground text-xs">
          {format(new Date(row.getValue("createdAt")), "MMM d, HH:mm:ss")}
        </div>
      );
    },
  },
  {
    accessorKey: "userName",
    header: "User",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("userName")}</span>
          <span className="text-muted-foreground text-[10px] uppercase">
            {row.original.userRole}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action") as ActivityAction;
      return (
        <div className="font-mono text-xs font-medium">
          {action.replace(/_/g, " ")}
        </div>
      );
    },
  },
  {
    accessorKey: "targetId",
    header: "Target ID",
    cell: ({ row }) => {
      const targetId = row.getValue("targetId") as string;
      return targetId ? (
        <code className="bg-muted rounded px-1 py-0.5 text-[10px]">
          {targetId}
        </code>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "riskLevel",
    header: "Risk",
    cell: ({ row }) => {
      const risk = row.getValue("riskLevel") as string;
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1 border-none px-2 py-0 text-[10px] font-bold tracking-wider uppercase",
            risk === "HIGH" &&
              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            risk === "MEDIUM" &&
              "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
            risk === "LOW" &&
              "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          )}
        >
          {risk === "HIGH" && <ShieldAlert className="h-3 w-3" />}
          {risk === "MEDIUM" && <AlertTriangle className="h-3 w-3" />}
          {risk === "LOW" && <Info className="h-3 w-3" />}
          {risk}
        </Badge>
      );
    },
  },
];

export function ActivityLogTable({ data, isLoading }: ActivityLogTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="userName"
      searchPlaceholder="Search users..."
      isLoading={isLoading}
    />
  );
}
