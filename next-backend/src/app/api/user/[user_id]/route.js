// src/app/api/user/[user_id]/route.js

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, successResponse, optionsResponse, printExceptionLog } from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req, { params }) {
  try {
    const currentUser = getUserFromRequest(req);
    if (!currentUser) {
      return errorResponse("Unauthorized", 401);
    }

    const resolvedParams = await params;
    const userId = resolvedParams?.user_id;

    if (!userId) {
      return errorResponse("User ID is required", 400);
    }

    const db = await getDb();
    let query;
    try {
      query = { _id: new ObjectId(userId) };
    } catch {
      query = { _id: userId };
    }

    const user = await db
      .collection("users")
      .findOne(query, { projection: { password: 0 } });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse(user);
  } catch (error) {
    printExceptionLog("Get User by ID", error);
    return errorResponse("Internal server error", 500);
  }
}
