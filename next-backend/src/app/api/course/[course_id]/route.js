// src/app/api/course/[course_id]/route.js

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
 * GET /api/course/[course_id]
 * - Teachers can view only their own courses (includes enrolled students).
 * - Students can view course details (excluding Cancel status).
 */
export async function GET(req, { params }) {
  try {
    const user = getUserFromRequest(req);
    const resolvedParams = await params;
    const courseId = resolvedParams?.course_id;

    if (!courseId) {
      return errorResponse("Course ID is required", 400);
    }

    const db = await getDb();
    const course = await db.collection("courses").findOne(getCourseQuery(courseId));

    if (!course) {
      return errorResponse("Course not found", 404);
    }

    // Role-based visibility and ownership enforcement:
    if (user?.role === "Teacher") {
      const isOwner =
        course.teacherId === user.id || course.teacherEmail === user.email;
      if (!isOwner) {
        return errorResponse("Access denied: You can only view your own courses", 403);
      }
      // Course details for Teacher includes enrolled Students
      return successResponse(course);
    }

    // Student or unauthenticated view
    if (course.status === "Cancel") {
      return errorResponse("Course not found", 404);
    }

    // Provide student-friendly details
    const isEnrolled = user
      ? course.enrolledStudents?.some((s) => s.studentId === user.id)
      : false;

    const studentCourseView = {
      ...course,
      enrolledCount: course.enrolledStudents ? course.enrolledStudents.length : 0,
      isEnrolled,
      // For student view, we omit full list of other students for privacy
      enrolledStudents: isEnrolled
        ? course.enrolledStudents.filter((s) => s.studentId === user.id)
        : [],
    };

    return successResponse(studentCourseView);
  } catch (error) {
    printExceptionLog("Get Course Details", error);
    return errorResponse("Internal server error", 500);
  }
}

/**
 * PUT /api/course/[course_id]
 * - Only the owning Teacher can update their course.
 */
export async function PUT(req, { params }) {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    if (user.role !== "Teacher") {
      return errorResponse("Only Teachers can update courses", 403);
    }

    const resolvedParams = await params;
    const courseId = resolvedParams?.course_id;

    if (!courseId) {
      return errorResponse("Course ID is required", 400);
    }

    const db = await getDb();
    const coursesCollection = db.collection("courses");
    const existingCourse = await coursesCollection.findOne(getCourseQuery(courseId));

    if (!existingCourse) {
      return errorResponse("Course not found", 404);
    }

    // Verify ownership
    const isOwner =
      existingCourse.teacherId === user.id ||
      existingCourse.teacherEmail === user.email;
    if (!isOwner) {
      return errorResponse("Forbidden: You can only update your own courses", 403);
    }

    const body = await req.json();
    const updateFields = { updatedAt: new Date() };

    if (body.name !== undefined) {
      if (!body.name.trim()) return errorResponse("Course name cannot be empty", 400);
      updateFields.name = body.name.trim();
    }

    if (body.duration !== undefined) {
      const dur = Number(body.duration);
      if (isNaN(dur) || dur <= 0) return errorResponse("Duration must be positive days", 400);
      updateFields.duration = dur;
    }

    if (body.topics !== undefined) {
      let parsedTopics = [];
      if (Array.isArray(body.topics)) {
        parsedTopics = body.topics.map((t) => String(t).trim()).filter(Boolean);
      } else if (typeof body.topics === "string") {
        parsedTopics = body.topics.split(",").map((t) => t.trim()).filter(Boolean);
      }
      if (parsedTopics.length === 0) return errorResponse("At least one topic is required", 400);
      updateFields.topics = parsedTopics;
    }

    if (body.price !== undefined) {
      const p = Number(body.price);
      if (isNaN(p) || p < 0) return errorResponse("Price must be a valid non-negative number", 400);
      updateFields.price = p;
    }

    if (body.maxStudents !== undefined) {
      const maxS = parseInt(body.maxStudents, 10);
      const currentEnrolledCount = existingCourse.enrolledStudents?.length || 0;
      if (isNaN(maxS) || maxS <= 0) return errorResponse("Max Student must be a positive integer", 400);
      if (maxS < currentEnrolledCount) {
        return errorResponse(
          `Cannot reduce Max Students below current enrollment count (${currentEnrolledCount})`,
          400,
        );
      }
      updateFields.maxStudents = maxS;
    }

    if (body.status !== undefined) {
      const validStatuses = ["Open", "Close", "Cancel"];
      if (!validStatuses.includes(body.status)) {
        return errorResponse("Invalid status. Allowed values: Open, Close, Cancel", 400);
      }
      updateFields.status = body.status;
    }

    await coursesCollection.updateOne(getCourseQuery(courseId), {
      $set: updateFields,
    });

    const updatedCourse = await coursesCollection.findOne(getCourseQuery(courseId));

    return successResponse({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    printExceptionLog("Update Course", error);
    return errorResponse("Internal server error", 500);
  }
}

/**
 * DELETE /api/course/[course_id]
 * - Delete the Teacher's own course only when no Student has enrolled.
 */
export async function DELETE(req, { params }) {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    if (user.role !== "Teacher") {
      return errorResponse("Only Teachers can delete courses", 403);
    }

    const resolvedParams = await params;
    const courseId = resolvedParams?.course_id;

    if (!courseId) {
      return errorResponse("Course ID is required", 400);
    }

    const db = await getDb();
    const coursesCollection = db.collection("courses");
    const existingCourse = await coursesCollection.findOne(getCourseQuery(courseId));

    if (!existingCourse) {
      return errorResponse("Course not found", 404);
    }

    // Verify ownership
    const isOwner =
      existingCourse.teacherId === user.id ||
      existingCourse.teacherEmail === user.email;
    if (!isOwner) {
      return errorResponse("Forbidden: You can only delete your own courses", 403);
    }

    // Restriction: Delete the Teacher's own course ONLY when no Student has enrolled
    const enrolledCount = existingCourse.enrolledStudents?.length || 0;
    if (enrolledCount > 0) {
      return errorResponse(
        `Cannot delete course: ${enrolledCount} student(s) are already enrolled`,
        400,
      );
    }

    await coursesCollection.deleteOne(getCourseQuery(courseId));

    return successResponse({
      message: "Course deleted successfully",
    });
  } catch (error) {
    printExceptionLog("Delete Course", error);
    return errorResponse("Internal server error", 500);
  }
}