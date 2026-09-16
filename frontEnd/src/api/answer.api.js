import api from "./axios";

export async function postAnswer(payload) {
  const response = await api.post("/answers", payload);
  return response.data;
}

export async function getAnswers(questionId, sortBy = "newest") {
  const response = await api.get("/answers", {
    params: { questionId, sortBy },
  });
  return response.data;
}

export async function getSingleAnswer(answerId) {
  const response = await api.get(`/answers/${answerId}`);
  return response.data;
}

export async function updateAnswer(answerId, payload) {
  const response = await api.patch(`/answers/${answerId}`, payload);
  return response.data;
}

export async function deleteAnswer(answerId) {
  const response = await api.delete(`/answers/${answerId}`);
  return response.data;
}
