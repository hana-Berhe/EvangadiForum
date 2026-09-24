import api from "./axios";

export async function registerUser(payload) {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}


// [Rooms E - Wonde] getCurrentUser - reads the admin role (GET /api/auth/me).
// The logged-in user with the role, read fresh from the database.
export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data;
}

