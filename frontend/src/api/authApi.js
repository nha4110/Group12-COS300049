import axios from "axios";

const API_URL = "http://localhost:8081"; // Matches your backend

// Signup Function
export const signup = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, { username, email, password });

    if (response.data.success) {
      // Backend returns walletAddress, store it consistently
      localStorage.setItem("wallet_address", response.data.walletAddress);
    }

    return response.data;
  } catch (error) {
    console.error("Signup error:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || "Signup failed" };
  }
};

// Login Function
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });

    if (response.data.token) {
      const userData = {
        ...response.data.user,
        wallet_address: response.data.user.wallet_address, // Match Login.jsx expectation
      };

      localStorage.setItem("jwtToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("wallet_address", userData.wallet_address); // Consistent key

      return { success: true, token: response.data.token, user: userData };
    }

    return { success: false, message: "Invalid login response" };
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || "Login failed" };
  }
};

// Fetch Wallet Address (Adjusted to match a realistic endpoint)
export const getWalletAddress = async () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) return { success: false, message: "No token found" };

  try {
    // Assuming /wallet/address/:walletAddress or similar exists
    const walletAddress = localStorage.getItem("wallet_address");
    const response = await axios.get(`${API_URL}/wallet/address/${walletAddress}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Wallet fetch error:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || "Failed to get wallet" };
  }
};

// Logout Function
export const logout = () => {
  localStorage.removeItem("jwtToken"); // Match key used elsewhere
  localStorage.removeItem("user");
  localStorage.removeItem("wallet_address"); // Consistent with login/signup
};