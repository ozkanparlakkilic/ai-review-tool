import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/auth";
import { NextResponse } from "next/server";
import type { Role } from "@/shared/constants/roles";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth(allowedRoles?: Role[]) {
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(session.user.role)
  ) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return session;
}
