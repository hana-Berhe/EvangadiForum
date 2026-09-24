import api from "./axios";

// One chat message in, one assistant reply out.
// The reply is { success, message, data: { kind, answer, grounded, sources, related } }.
export async function sendChatMessage(message) {
  const response = await api.post(
    "/chat",
    { message },
    // The server may try Gemini twice (20 seconds each), so wait longer.
    { timeout: 60000 },
  );
  return response.data;
}
