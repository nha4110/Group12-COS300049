import axios from "axios";

const API_URL = "http://localhost:8081"; // Ensure this is correct

// ✅ Signup Function - Now Returns Wallet Address
export const signup = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, { username, email, password });

    if (response.data.success) {
      localStorage.setItem("wallet", response.data.wallet_address); // ✅ Store wallet address
    }

    return response.data;
  } catch (error) {
    console.error("Signup error:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.error || "Signup failed" };
  }
};

// ✅ Login Function - Stores Wallet Address
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });

    if (response.data.token) {
      const userData = {
        ...response.data.user,
        walletAddress: response.data.user.wallet_address // ✅ Ensure wallet is stored
      };

      localStorage.setItem("jwtToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("wallet", userData.walletAddress);

      return { success: true, token: response.data.token, user: userData };
    }

    return { success: false, message: "Invalid login response" };
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.error || "Login failed" };
  }
};


// ✅ Fetch Wallet Address
export const getWalletAddress = async () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) return { success: false, message: "No token found" };

  try {
    const response = await axios.get(`${API_URL}/wallet`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Wallet fetch error:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.error || "Failed to get wallet" };
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
