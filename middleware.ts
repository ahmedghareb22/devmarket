import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/", "/auth/login", "/auth/register", "/courses"];
const sellerRoutes = ["/seller", "/dashboard"];
const buyerRoutes = ["/dashboard", "/my-courses"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth();

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Check role-based access
  if (sellerRoutes.some((route) => pathname.startsWith(route))) {
    if (session.user?.role !== "SELLER" && session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
