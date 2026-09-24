import api from "./axios";

// [Rooms C - Abel] Join, leave, members.
// ---------- membership ----------
export async function joinRoom(roomId) {
  const response = await api.post(`/rooms/${roomId}/members`);
  return response.data;
}

export async function leaveRoom(roomId) {
  const response = await api.delete(`/rooms/${roomId}/members/me`);
  return response.data;
}

export async function listRoomMembers(roomId) {
  const response = await api.get(`/rooms/${roomId}/members`);
  return response.data;
}
