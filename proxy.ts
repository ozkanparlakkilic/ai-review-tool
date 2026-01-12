import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { ROLES } from "@/shared/constants/roles";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isInsightsPage = req.nextUrl.pathname.startsWith("/insights");
    const isAuditLogPage = req.nextUrl.pathname.startsWith("/audit-log");

    if ((isInsightsPage || isAuditLogPage) && token?.role !== ROLES.ADMIN) {
      return NextResponse.rewrite(new URL("/forbidden", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
  }
);

export const config = {
  matcher: ["/", "/review/:path*", "/insights/:path*", "/audit-log/:path*"],
};
