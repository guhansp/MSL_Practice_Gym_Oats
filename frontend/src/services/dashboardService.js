import API from "./api";

export const fetchUserDashboard = async () => {
  const res = await API.get("/dashboard/userData");
  return res.data;
};

export async function fetchUserSessions() {
  const res = await API.get("/sessions");
  return res.data.sessions;
}
export const fetchUserStats = async () => {
  const res = await API.get("/sessions/statsall");
  return res.data; 
};


