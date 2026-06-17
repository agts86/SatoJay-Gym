import { NextResponse, type NextRequest } from "next/server";

const adminCookie = "satojay_admin_session";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/bookings") && !request.cookies.has(adminCookie)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/bookings/:path*"],
};
