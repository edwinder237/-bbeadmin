// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(() => {
  return NextResponse.next();
});

export const config = {
  // Match all routes (avoid matching files like _next or static assets)
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};