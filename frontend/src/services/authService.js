import API from "./api";

// ---------- SIGN-UP ----------
export const signUp = async (payload) => {
  const res = await API.post("/auth/signup", payload);
  return res.data;
};

// ---------- LOGIN ----------
export const logIn = async (payload) => {
  const res = await API.post("/auth/login", payload);
  return res.data;
};

// ---------- CURRENT USER ----------
export const getCurrentUser = async () => {
  const res = await API.get("/auth/me");
  return res.data;
};

// ---------- LOGOUT ----------
export const logOut = async () => {
  const res = await API.post("/auth/logout");
  localStorage.removeItem("token");
  return res.data;
};

// ---------- VERIFY TOKEN ----------
export const verifyToken = async () => {
  const res = await API.get("/auth/verify");
  return res.data;
};
