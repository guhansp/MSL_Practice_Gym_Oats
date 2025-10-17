// src/lib/api.js
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${path} failed with ${res.status}`);
  return res.json();
}

export async function apiPost(path, body, isFormData = false) {
  const init = isFormData
    ? { method: "POST", body }
    : {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      };
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) throw new Error(`POST ${path} failed with ${res.status}`);
  return res.json();
}
