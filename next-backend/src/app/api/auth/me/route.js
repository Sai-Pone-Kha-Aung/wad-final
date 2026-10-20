// src/app/api/auth/me/route.js

import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, successResponse, optionsResponse } from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) {
    return errorResponse("Unauthorized", 401);
  }
  return successResponse({ user });
}
