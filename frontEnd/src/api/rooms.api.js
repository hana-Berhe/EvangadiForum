import api from "./axios";




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
  return response.data;
}
