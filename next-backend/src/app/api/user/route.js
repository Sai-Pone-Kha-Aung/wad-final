// src/app/api/user/route.js

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, successResponse, optionsResponse, printExceptionLog } from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req) {
  try {
    const currentUser = getUserFromRequest(req);
    if (!currentUser) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");

    const query = {};
    if (roleFilter) {
      query.role = roleFilter;
    }

    const db = await getDb();
    const users = await db
      .collection("users")
      .find(query, { projection: { password: 0 } })
      .toArray();

    return successResponse(users);
  } catch (error) {
    printExceptionLog("Get Users", error);
    return errorResponse("Internal server error", 500);
  }
}