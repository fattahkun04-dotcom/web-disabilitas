import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/dashboard", "/profil", "/forum", "/keuangan"];
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const path = request.nextUrl.pathname;

  const isProtected = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
  const isAdmin = adminRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  if (isProtected || isAdmin) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdmin) {
      const role = token.role as string;
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // Redirect logged-in users away from auth pages
  if ((path === "/login" || path === "/daftar") && token) {
    const role = token.role as string;
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profil/:path*",
    "/forum/:path*",
    "/keuangan/:path*",
    "/admin/:path*",
    "/login",
    "/daftar",
  ],
};
