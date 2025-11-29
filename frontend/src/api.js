import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";


export const register = (username, password, role = "parent") =>
  axios.post(`${BASE}/auth/register`, { username, password, role });

export const login = (username, password) =>
  axios.post(`${BASE}/auth/login`, { username, password });

export const createSession = (token, game_type, score, duration, mistakes = 0) =>
  axios.post(
    `${BASE}/api/sessions`,
    { game_type, score, duration, mistakes },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const listSessions = (token) =>
  axios.get(`${BASE}/api/sessions`, { headers: { Authorization: `Bearer ${token}` } });

export const listUsers = (token) =>
  axios.get(`${BASE}/api/users`, { headers: { Authorization: `Bearer ${token}` } });

export const analyzeUser = (token, username) =>
  axios.get(`${BASE}/api/analysis/${encodeURIComponent(username)}`, { headers: { Authorization: `Bearer ${token}` } });
