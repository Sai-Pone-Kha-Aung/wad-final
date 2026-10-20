import jwt from "jsonwebtoken";
import {
  X_HEADER_USER_EMAIL,
  X_HEADER_USER_ID,
  X_HEADER_USER_NAME,
  X_HEADER_USER_ROLE,
} from "./constant";

function getSecret() {
  return process.env.JWT_SECRET || "c3eb82eaf05c2c88dcd29e9c56a96b16d7b96f1b605014efe4c5752837449649";
}

export function signJWT(payload, expiresIn = "7d") {
  return jwt.sign(payload, getSecret(), { expiresIn });
}

export function verifyJWT(req) {
  try {
    let token = null;

    // 1. Check cookies (NextRequest cookie store)
    if (req?.cookies?.get) {
      token = req.cookies.get("token")?.value;
    } else if (req?.cookies?.token) {
      token = req.cookies.token;
    }

    // 2. Check Authorization header: Bearer <token>
    if (!token && req?.headers) {
      const authHeader =
        typeof req.headers.get === "function"
          ? req.headers.get("authorization") || req.headers.get("Authorization")
          : req.headers["authorization"] || req.headers["Authorization"];

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, getSecret());
    return decoded;
  } catch (err) {
    return null;
  }
}

export function getUserFromRequest(req) {
  // First check if headers were already populated by proxy
  const getHeader = (key) =>
    typeof req?.headers?.get === "function" ? req.headers.get(key) : req?.headers?.[key];

  const headerId = getHeader(X_HEADER_USER_ID);
  if (headerId) {
    return {
      id: headerId,
      username: getHeader(X_HEADER_USER_NAME),
      email: getHeader(X_HEADER_USER_EMAIL),
      role: getHeader(X_HEADER_USER_ROLE),
    };
  }

  // Fallback to verifying JWT directly
  const decoded = verifyJWT(req);
  if (decoded) {
    return {
      id: decoded.id || decoded._id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };
  }

  return null;
}