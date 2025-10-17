import API from "./api";

export const fetchConversationSummary = async (sessionId) => {
  const response = await API.get(`/sessions/${sessionId}/getConversationSummary`);
  return response.data;
};