import axios from "axios";

const API_URL = "http://localhost:8081";

export const signup = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, { username, email, password });
    if (response.data.success) {
      localStorage.setItem("wallet_address", response.data.walletAddress);
    }
    return response.data;
  } catch (error) {
    console.error("Signup error:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || "Signup failed" };
  }
};

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    if (response.data.success) {
      const userData = {
        accountId: response.data.user.accountId,
        username: response.data.user.username,
        email: response.data.user.email,
        wallet_address: response.data.user.wallet_address,
      };
      localStorage.setItem("jwtToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("wallet_address", userData.wallet_address);
      return { success: true, token: response.data.token, user: userData };
    }
    return { success: false, message: response.data.message || "Invalid login response" };
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || "Login failed" };
  }
};

export const getWalletAddress = async () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) return { success: false, message: "No token found" };

  try {
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

export const logout = () => {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("user");
  localStorage.removeItem("wallet_address");
};