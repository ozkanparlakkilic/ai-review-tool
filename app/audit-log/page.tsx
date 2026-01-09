"use client";

import { useQuery } from "@tanstack/react-query";
import { activityLogService } from "@/features/audit-log/services/activity-log";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { AppShell } from "@/shared/components/app-shell";
import { ROLES } from "@/shared/constants/roles";
import { ActivityLogTable } from "@/features/audit-log/components/activity-log-table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export default function AuditLogPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["activity-logs"],
    queryFn: () => activityLogService.getLogs(),
  });

  const handleExport = () => {
    if (!logs || logs.length === 0) {
      toast.error("No logs to export");
      return;
    }

    const headers = [
      "ID",
      "Timestamp",
      "User",
      "Role",
      "Action",
      "Target ID",
      "Risk Level",
    ];
    const csvContent = [
      headers.join(","),
      ...logs.map((log) =>
        [
          log.id,
          log.createdAt,
          log.userName,
          log.userRole,
          log.action,
          log.targetId || "",
          log.riskLevel,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `audit-log-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audit log exported successfully");
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      <AppShell>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Audit Log</h2>
            <p className="text-muted-foreground mt-1">
              Track and audit all critical actions performed in the system
            </p>
          </div>
          <Button onClick={handleExport} variant="outline" disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <ActivityLogTable data={logs || []} isLoading={isLoading} />
      </AppShell>
    </ProtectedRoute>
  );
}
