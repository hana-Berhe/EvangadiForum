import api from "./axios";

export async function getUserProfile(userId) {
  const response = await api.get(`/users/${userId}`);
  return response.data;
}

export async function updateUserProfile(userId, payload) {
  const isFormData = payload instanceof FormData;

  const response = await api.put(`/users/${userId}`, payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });

  return response.data;
}
