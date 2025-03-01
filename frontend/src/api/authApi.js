import axios from "axios";

const API_URL = "http://localhost:8081"; // Ensure this is correct

// ✅ Signup Function
export const signup = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, { username, email, password });
    return response.data;
  } catch (error) {
    console.error("Signup error:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.error || "Signup failed" };
  }
};

// ✅ Login Function (Updated)
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });

    if (response.data.token) {
      localStorage.setItem("jwtToken", response.data.token); // ✅ Store Token
      localStorage.setItem("user", JSON.stringify(response.data.user)); // ✅ Store User Info
      return { success: true, token: response.data.token, user: response.data.user };
    }

    return { success: false, message: "Invalid login response" };
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.error || "Login failed" };
  }
};

// ✅ Get Current User (Requires Token)
export const getCurrentUser = async () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) return { success: false, message: "No token found" };

  try {
    const response = await axios.get(`${API_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, user: response.data };
  } catch (error) {
    console.error("Get user error:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.error || "Failed to get user" };
  }
};

// ✅ Logout Function (Clears Token & User Data)
export const logout = () => {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("user");
};
