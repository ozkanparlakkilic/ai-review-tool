"use client";

import { ProtectedRoute } from "@/shared/components/protected-route";
import { ROLES } from "@/shared/constants/roles";
import { InsightsInner } from "@/features/insights/components/insights-inner";

export default function InsightsPage() {
  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      <InsightsInner />
    </ProtectedRoute>
  );
}
