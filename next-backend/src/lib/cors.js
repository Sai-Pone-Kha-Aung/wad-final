export function getCleanOrigin(input) {
  const raw = input || process.env.FRONTEND_URL;
  if (!raw) return "http://localhost:5173";
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return url.origin; // Extracts strictly scheme + host without any trailing path
  } catch {
    return raw.replace(/\/+$/, "");
  }
}

export function getCorsHeaders(req) {
  let origin = getCleanOrigin();
  if (req) {
    const reqOrigin = typeof req.headers?.get === "function" 
      ? req.headers.get("origin") 
      : req.headers?.origin;
    if (reqOrigin) {
      origin = getCleanOrigin(reqOrigin);
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
  get "Access-Control-Allow-Origin"() {
    return getCleanOrigin();
  },
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-id, x-user-email, x-user-username, x-user-role",
  "Access-Control-Max-Age": "86400",
};

export default corsHeaders;

