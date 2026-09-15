import api from "./axios";
export async function runDraftCoach(payload) {
  const response = await api.post("/questions/draft-coach", payload);
  return response.data;
}