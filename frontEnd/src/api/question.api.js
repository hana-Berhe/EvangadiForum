import api from "./axios";

export async function createQuestion(payload) {
  const response = await api.post("/questions", payload);
  return response.data;
}

export async function getAllQuestions(params = {}) {
  const response = await api.get("/questions", { params });
  return response.data;
}

export async function getQuestion(questionHash) {
  const response = await api.get(`/questions/${questionHash}`);
  return response.data;
}

export async function semanticSearch(params) {
  const response = await api.get("/questions/search", { params });
  return response.data;
}

export async function getSimilarQuestions(questionHash, params = {}) {
  const response = await api.get(`/questions/${questionHash}/similar`, {
    params,
  });
  return response.data;
}

export async function runDraftCoach(payload) {
  const response = await api.post("/questions/draft-coach", payload);
  return response.data;
}

export async function checkAnswerFit(questionHash, answerText) {
  const response = await api.post(`/questions/${questionHash}/answer-fit`, {
    answerText,
  });
  return response.data;
}

export async function updateQuestion(questionHash, payload) {
  const response = await api.patch(`/questions/${questionHash}`, payload);
  return response.data;
}

export async function deleteQuestion(questionHash) {
  const response = await api.delete(`/questions/${questionHash}`);
  return response.data;
}

// this is a file where functions related to question API calls are defined. 
