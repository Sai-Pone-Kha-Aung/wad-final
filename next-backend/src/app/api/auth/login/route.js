// src/app/api/auth/login/route.js

import bcrypt from "bcrypt";
import { getDb } from "@/lib/mongodb";
import { signJWT } from "@/lib/auth";
import { errorResponse, successResponse, optionsResponse, printExceptionLog } from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const identifier = body.identifier || body.email || body.username;
    const password = body.password;

    if (!identifier || !password) {
      return errorResponse("Please provide email/username and password", 400);
    }

    const db = await getDb();
    const usersCollection = db.collection("users");

    // Case-insensitive lookup for email or username
    const user = await usersCollection.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${identifier.trim()}$`, "i") } },
        { username: { $regex: new RegExp(`^${identifier.trim()}$`, "i") } },
      ],
    });

    if (!user) {
      return errorResponse("Invalid email/username or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse("Invalid email/username or password", 401);
    }

    const payload = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = signJWT(payload);

    const response = successResponse({
      message: "Login successful",
      user: payload,
      token,
    });

    // Set HTTP-only cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    printExceptionLog("Login", error);
    return errorResponse("Internal server error", 500);
  }
}