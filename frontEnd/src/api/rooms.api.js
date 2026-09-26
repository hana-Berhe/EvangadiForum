import api from "./axios";


export async function listRooms() {
  const response = await api.get("/rooms");
  return response.data;
}

// [Rooms E - Wonde] Admin list and close.
// ---------- admin ----------
// status: "open", "closed", or nothing for every room.
export async function adminListRooms(status) {
  const response = await api.get("/admin/rooms", {
    params: status ? { status } : {},
  });
  return response.data;
}

export async function closeRoom(roomId) {
  const response = await api.patch(`/admin/rooms/${roomId}/close`);
}
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
