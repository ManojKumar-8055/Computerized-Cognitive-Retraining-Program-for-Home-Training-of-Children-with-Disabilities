import axios from "axios";

const API_BASE = "http://127.0.0.1:5000"; // your Flask backend URL

export const register = (username, password) =>
  axios.post(`${API_BASE}/auth/register`, { username, password });

export const login = (username, password) =>
  axios.post(`${API_BASE}/auth/login`, { username, password });

export const createSession = (token, game_type, score, duration) =>
  axios.post(
    `${API_BASE}/api/sessions`,
    { game_type, score, duration },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const listSessions = (token) =>
  axios.get(`${API_BASE}/api/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
