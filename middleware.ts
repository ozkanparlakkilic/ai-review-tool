import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { ROLES } from "@/shared/constants/roles";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isInsightsPage = req.nextUrl.pathname.startsWith("/insights");

    // Role-based access control for /insights
    if (isInsightsPage && token?.role !== ROLES.ADMIN) {
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
  }
);

export const config = {
  matcher: ["/", "/review/:path*", "/insights/:path*"],
};
