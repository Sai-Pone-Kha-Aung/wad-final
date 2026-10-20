import { NextResponse } from "next/server";
import { verifyJWT } from "./lib/auth";
import corsHeaders, { getCorsHeaders } from "./lib/cors";
import {
  X_HEADER_USER_EMAIL,
  X_HEADER_USER_ID,
  X_HEADER_USER_NAME,
  X_HEADER_USER_ROLE,
} from "./lib/constant";

export function proxy(request) {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(request),
    });
  }

  const { pathname } = request.nextUrl;

  // Public endpoints that don't require authentication
  const isPublicAuthRoute =
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/logout";

  if (isPublicAuthRoute) {
    return NextResponse.next();
  }

  const user = verifyJWT(request);

  // Protected operations that strictly require authentication:
  // - Any mutation (POST, PUT, PATCH, DELETE)
  // - Any enrollment endpoint (/api/course/.../enroll)
  // - Any user endpoint (/api/user/...)
  const isProtectedOperation =
    request.method !== "GET" ||
    pathname.includes("/enroll") ||
    pathname.startsWith("/api/user");

  if (isProtectedOperation && !user) {
    return NextResponse.json(
      {
        message: "Unauthorized Request",
      },
      {
        status: 401,
        headers: corsHeaders,
      },
    );
  }

  const requestHeaders = new Headers(request.headers);
  if (user) {
    requestHeaders.set(X_HEADER_USER_ID, user.id || user._id);
    requestHeaders.set(X_HEADER_USER_EMAIL, user.email);
    requestHeaders.set(X_HEADER_USER_NAME, user.username);
    requestHeaders.set(X_HEADER_USER_ROLE, user.role);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/:path*"],
};

