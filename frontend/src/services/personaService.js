import API from "./api";

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
