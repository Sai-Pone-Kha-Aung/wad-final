// src/app/api/course/enrolled/route.js

import { getDb } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, successResponse, optionsResponse, printExceptionLog } from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

/**
 * GET /api/course/enrolled
 * - Authenticated Students only.
 * - Returns all courses where the current student is enrolled.
 */
export async function GET(req) {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    if (user.role !== "Student") {
      return errorResponse("Only Students can view enrolled courses", 403);
    }

    const db = await getDb();
    const courses = await db
      .collection("courses")
      .find({
        $or: [
          { "enrolledStudents.studentId": user.id },
          { "enrolledStudents.email": user.email },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    return successResponse(courses);
  } catch (error) {
    printExceptionLog("Get Enrolled Courses", error);
    return errorResponse("Internal server error", 500);
  }
}
