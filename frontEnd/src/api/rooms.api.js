import api from "./axios";

// Every function returns the server reply: { success, message, data }.
// A failed request rejects. Read the text with getErrorMessage(error),
// and the status with error.response?.status.

// ---------- rooms ----------
export async function listRooms() {
  const response = await api.get("/rooms");
  return response.data;
}

export async function getRoom(roomId) {
  const response = await api.get(`/rooms/${roomId}`);
  return response.data;
}

// ---------- membership ----------
export async function joinRoom(roomId) {
  const response = await api.post(`/rooms/${roomId}/members`);
  return response.data;
}

// ---------- messages ----------
// The latest 50 messages, oldest first.
export async function listRoomMessages(roomId) {
  const response = await api.get(`/rooms/${roomId}/messages`);
  return response.data;
}

export async function postRoomMessage(roomId, content) {
  const response = await api.post(`/rooms/${roomId}/messages`, { content });
  return response.data;
}
