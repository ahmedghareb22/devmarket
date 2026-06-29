import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/", "/auth/login", "/auth/register", "/courses"];
const sellerRoutes = ["/seller"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes without auth check
  if (
    publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
  ) {
    return NextResponse.next();
  }

  // Allow API auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const session = await auth();

  // Redirect to login if not authenticated
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Check role-based access for seller routes
  const userRole = (session.user as { role?: string })?.role;
  if (sellerRoutes.some((route) => pathname.startsWith(route))) {
    if (userRole !== "SELLER" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
