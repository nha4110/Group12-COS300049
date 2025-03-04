import axios from "axios";

const API_URL = "http://localhost:8081/wallet"; // Adjust if your backend port is different

// ✅ Fetch Wallet Address
export const getWallet = async (userId) => {
    try {
        const res = await axios.get(`${API_URL}/${userId}`);
        return res.data;
    } catch (error) {
        console.error("Error fetching wallet:", error);
        return { success: false };
    }
};

// ✅ Create New Wallet
export const createWallet = async () => {
    try {
        const res = await axios.post(`${API_URL}/create`);
        return res.data;
    } catch (error) {
        console.error("Error creating wallet:", error);
        return { success: false };
    }
};

// ✅ Fetch ETH Balance
export const getBalance = async (walletAddress) => {
    try {
        const res = await axios.get(`${API_URL}/balance/${walletAddress}`);
        return res.data;
    } catch (error) {
        console.error("Error fetching balance:", error);
        return { success: false };
    }
};
