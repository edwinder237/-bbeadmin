// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Simple middleware without authentication
  return NextResponse.next();
}

export const config = {
  // Match all routes (avoid matching files like _next or static assets)
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};