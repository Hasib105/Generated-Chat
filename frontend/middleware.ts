import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
   const token = request.cookies.get("access_token");


  const protectedRoutes = ["/", "/settings"];

  if (
    protectedRoutes.some((route) => request.nextUrl.pathname === route) &&
    !token
  ) {
    return NextResponse.redirect(new URL("/login", request.url)); 
  }

  return NextResponse.next(); 
}

export const config = {
  matcher: ["/", "/settings"],
};
