const API_URL = "http://localhost:5000/auth"; // Backend API
import { jwtDecode } from "jwt-decode";



// ✅ Signup Function
export const signup = async (username, email, password) => {
  const res = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
};

// ✅ Login Function (Now Stores Token & User Data)
export const login = async (username, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
};



export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token); // ✅ Safely decode token
    if (decoded.exp * 1000 < Date.now()) {
      logout(); // Token expired, clear storage
      return false;
    }
    return true;
  } catch (error) {
    logout(); // Invalid token
    return false;
  }
};

// ✅ getCurrentUser Function
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

// ✅ Logout Function
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
