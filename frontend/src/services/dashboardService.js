import API from "./api";

export const fetchUserDashboard = async () => {
  const res = await API.get("/dashboard/userData");
  return res.data;
};

export async function fetchUserSessions() {
  const res = await API.get("/sessions");
  return res.data.sessions;
}

export async function fetchHeatMap(days) {
  const res = await API.get(`/analytics/heatmap?days=${days}`);
  return res.data;
}