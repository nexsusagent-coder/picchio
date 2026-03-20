import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only protect /admin routes (except /admin/login itself)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const accessToken = request.cookies.get("sb-access-token") || 
                        request.cookies.get("sb-bvpruuyztvkroovcoebe-auth-token");
    
    if (!accessToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
