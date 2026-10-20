// src/app/api/course/[course_id]/enroll/route.js

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, successResponse, optionsResponse, printExceptionLog } from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

function getCourseQuery(courseId) {
  try {
    return { _id: new ObjectId(courseId) };
  } catch {
    return { _id: courseId };
  }
}

/**
 * POST /api/course/[course_id]/enroll
 * - Authenticated Students only.
 * - Enforces business rules:
 *   1. Course must exist.
 *   2. Course status must be 'Open'.
 *   3. Available seats must remain (enrolledCount < maxStudents).
 *   4. Student cannot enroll in the same course more than once.
 */
export async function POST(req, { params }) {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      return errorResponse("Authentication required to enroll", 401);
    }

    if (user.role !== "Student") {
      return errorResponse("Only Students can enroll in courses", 403);
    }

    const resolvedParams = await params;
    const courseId = resolvedParams?.course_id;

    if (!courseId) {
      return errorResponse("Course ID is required", 400);
    }

    const db = await getDb();
    const coursesCollection = db.collection("courses");
    const course = await coursesCollection.findOne(getCourseQuery(courseId));

    if (!course) {
      return errorResponse("Course not found", 404);
    }

    // 1. Course status restriction: Open only
    if (course.status !== "Open") {
      return errorResponse(
        `Cannot enroll: Course status is '${course.status}'. Only 'Open' courses allow enrollment.`,
        400,
      );
    }

    // 2. Duplicate enrollment restriction
    const alreadyEnrolled = course.enrolledStudents?.some(
      (s) => s.studentId === user.id || s.email === user.email,
    );
    if (alreadyEnrolled) {
      return errorResponse("You are already enrolled in this course", 400);
    }

    // 3. Seat availability restriction
    const currentEnrolledCount = course.enrolledStudents?.length || 0;
    if (currentEnrolledCount >= course.maxStudents) {
      return errorResponse(
        `Cannot enroll: Course has reached maximum capacity of ${course.maxStudents} students.`,
        400,
      );
    }

    const studentRecord = {
      studentId: user.id,
      username: user.username,
      email: user.email,
      enrolledAt: new Date(),
    };

    // Atomic update to avoid race conditions
    await coursesCollection.updateOne(getCourseQuery(courseId), {
      $push: { enrolledStudents: studentRecord },
      $set: { updatedAt: new Date() },
    });

    return successResponse({
      message: "Successfully enrolled in course",
      courseId: course._id,
      courseName: course.name,
      enrolledAt: studentRecord.enrolledAt,
    });
  } catch (error) {
    printExceptionLog("Course Enrollment", error);
    return errorResponse("Internal server error", 500);
  }
}
