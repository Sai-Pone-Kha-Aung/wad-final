// src/app/api/course/route.js

import { getDb } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, successResponse, optionsResponse, printExceptionLog } from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

/**
 * GET /api/course
 * - For Teachers: Returns the teacher's own course list.
 * - For Students / Public: Returns all courses except Cancel status.
 *   Supports filters: ?name=<term>&teacher=<term>
 * - If ?enrolled=true is passed by a Student, returns the student's enrolled courses.
 */
export async function GET(req) {
  try {
    const user = getUserFromRequest(req);
    const { searchParams } = new URL(req.url);

    const nameFilter = searchParams.get("name")?.trim();
    const teacherFilter = searchParams.get("teacher")?.trim();
    const enrolledOnly = searchParams.get("enrolled") === "true";
    const forceAll = searchParams.get("all") === "true";

    const db = await getDb();
    const coursesCollection = db.collection("courses");

    let query = {};

    // 1. If enrolled courses requested by a student
    if (enrolledOnly && user) {
      query = {
        "enrolledStudents.studentId": user.id,
      };
    }
    // 2. Teacher view: default to showing their own courses
    else if (user?.role === "Teacher" && !forceAll) {
      query = {
        $or: [{ teacherId: user.id }, { teacherEmail: user.email }],
      };
    }
    // 3. Student or unauthenticated visitor view
    else {
      // Must not display courses with Cancel status
      query.status = { $ne: "Cancel" };

      // Filter by course name if provided
      if (nameFilter) {
        query.name = { $regex: nameFilter, $options: "i" };
      }

      // Filter by teacher name if provided
      if (teacherFilter) {
        query.teacherName = { $regex: teacherFilter, $options: "i" };
      }
    }

    const courses = await coursesCollection.find(query).sort({ createdAt: -1 }).toArray();

    return successResponse(courses);
  } catch (error) {
    printExceptionLog("Get Courses", error);
    return errorResponse("Internal server error", 500);
  }
}

/**
 * POST /api/course
 * - Only authenticated Teachers can create courses.
 */
export async function POST(req) {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    if (user.role !== "Teacher") {
      return errorResponse("Only authenticated Teachers can create courses", 403);
    }

    const body = await req.json();
    const { name, duration, topics, price, maxStudents, status } = body;

    // Validate course name
    if (!name || typeof name !== "string" || !name.trim()) {
      return errorResponse("Course name is required", 400);
    }

    // Validate duration (days)
    const parsedDuration = Number(duration);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      return errorResponse("Duration must be a positive number of days", 400);
    }

    // Validate topics (array of strings)
    let parsedTopics = [];
    if (Array.isArray(topics)) {
      parsedTopics = topics.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof topics === "string") {
      parsedTopics = topics
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (parsedTopics.length === 0) {
      return errorResponse("At least one topic is required", 400);
    }

    // Validate price
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return errorResponse("Price must be a valid non-negative number", 400);
    }

    // Validate maxStudents
    const parsedMaxStudents = parseInt(maxStudents, 10);
    if (isNaN(parsedMaxStudents) || parsedMaxStudents <= 0) {
      return errorResponse("Max Student must be a positive integer", 400);
    }

    // Validate status (Open / Close / Cancel)
    const validStatuses = ["Open", "Close", "Cancel"];
    const courseStatus = status && validStatuses.includes(status) ? status : "Open";

    const newCourse = {
      name: name.trim(),
      duration: parsedDuration,
      topics: parsedTopics,
      price: parsedPrice,
      maxStudents: parsedMaxStudents,
      status: courseStatus,
      teacherId: user.id,
      teacherName: user.username,
      teacherEmail: user.email,
      enrolledStudents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDb();
    const result = await db.collection("courses").insertOne(newCourse);

    return successResponse(
      {
        message: "Course created successfully",
        course: { _id: result.insertedId, ...newCourse },
      },
      201,
    );
  } catch (error) {
    printExceptionLog("Create Course", error);
    return errorResponse("Internal server error", 500);
  }
}