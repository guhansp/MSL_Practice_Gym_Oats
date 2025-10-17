import API from "./api";

export const fetchUserDashboard = async () => {
  const res = await API.get("/dashboard/userData");
  return res.data;
};
