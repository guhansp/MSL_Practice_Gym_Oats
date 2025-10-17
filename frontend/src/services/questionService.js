import API from "./api";

export const fetchQuestions = async () => {
  const res = await API.get("/questions");
  return res.data;
};

export const fetchQuestionById = async (id) => {
  const res = await API.get(`/questions/${id}`);
  return res.data;
};

export const fetchQuestionPersonas = async (id) => {
  const res = await API.get(`/questions/${id}/personas`);
  return res.data;
};
