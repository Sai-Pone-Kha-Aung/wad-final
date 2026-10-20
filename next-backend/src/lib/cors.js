export function getCorsHeaders(req) {
  let origin = process.env.FRONTEND_URL || "http://localhost:5173";
  if (req) {
    const reqOrigin = typeof req.headers?.get === "function" 
      ? req.headers.get("origin") 
      : req.headers?.origin;
    if (reqOrigin) {
      origin = reqOrigin;
    }
  }
  return {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-id, x-user-email, x-user-username, x-user-role",
    "Access-Control-Max-Age": "86400",
  };
}

let corsHeaders = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-id, x-user-email, x-user-username, x-user-role",
  "Access-Control-Max-Age": "86400",
};

export default corsHeaders;
