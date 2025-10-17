import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Get all personas
export const getAllPersonas = async () => {
  try {
    const response = await API.get("/data/personas");
    return response.data;
  } catch (error) {
    console.error("Error fetching personas:", error);
    throw error;
  }
};

// Get single persona by ID with their questions
export const getPersonaById = async (personaId) => {
  try {
    const response = await API.get(`/data/personas/${personaId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching persona details:", error);
    throw error;
  }
};


export default API;
