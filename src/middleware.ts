import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  // Debug token for development
  console.log("Auth middleware token:", {
    exists: !!token,
    isAdmin: token?.isAdmin
  });
  
  const { pathname } = req.nextUrl;
  
  // For admin routes (both page and API routes)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // If token exists but user is not admin, redirect to home
    if (!token || token.isAdmin !== true) {
      console.log("Admin auth failed in middleware, redirecting");
      
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json(
          { message: "Unauthorized access" },
          { status: 401 }
        );
      }
      
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  
  // For dashboard routes which require authentication
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    "/admin/:path*", 
    "/api/admin/:path*",
    "/dashboard/:path*",
  ],
};