// src/utils/api.js

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: "include", // send cookies
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export default request;
