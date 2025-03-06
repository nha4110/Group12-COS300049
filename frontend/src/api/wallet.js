import axios from "axios";

const API_URL = "http://localhost:8081/wallet"; // Ensure your backend is running

// ✅ Fetch user wallet address by accountId
export const getWallet = async (accountId) => {
    try {
        if (!accountId) throw new Error("Account ID is required.");

        const response = await axios.get(`${API_URL}/${accountId}`);
        return response.data; // { success: true, walletAddress: "0x..." }
    } catch (error) {
        console.error("❌ Error fetching wallet:", error.response?.data || error.message);
        return { success: false, message: "Failed to fetch wallet." };
    }
};

// ✅ Fix API Call (Remove extra `/wallet`)
export async function getWalletBalance(walletAddress) {
    console.log(`🔍 Fetching balance for: ${walletAddress}`);
    try {
        const response = await axios.get(`http://localhost:8081/wallet/balance/${walletAddress}`);
        return response.data.balance;
    } catch (error) {
        console.error("❌ Error fetching wallet balance:", error);
        return "0.0000"; // Default to 0 if error occurs
    }
}

// ✅ Create Wallet for a User
export const createWallet = async (userId) => {
    try {
        if (!userId) {
            throw new Error("User ID is required.");
        }

        const res = await axios.post(`${API_URL}/create`, { userId });
        return res.data; // { success: true, walletAddress: "0x..." }
    } catch (error) {
        console.error("❌ Error creating wallet:", error.response?.data || error.message);
        return { success: false, message: "Failed to create wallet." };
    }
};

// ✅ Send ETH Transaction
export const sendTransaction = async (fromWallet, toWallet, amount) => {
    try {
        if (!fromWallet || !toWallet || !amount) {
            throw new Error("From wallet, to wallet, and amount are required.");
        }

        const res = await axios.post(`${API_URL}/send`, { fromWallet, toWallet, amount });
        return res.data; // { success: true, transactionHash: "0x..." }
    } catch (error) {
        console.error("❌ Error sending transaction:", error.response?.data || error.message);
        return { success: false, message: "Transaction failed." };
    }
};

// ✅ Get Transaction History
export const getTransactionHistory = async (walletAddress) => {
    try {
        if (!walletAddress) {
            throw new Error("Wallet address is required.");
        }

        const res = await axios.get(`${API_URL}/transactions/${walletAddress}`);
        return res.data; // { success: true, transactions: [...] }
    } catch (error) {
        console.error("❌ Error fetching transactions:", error.response?.data || error.message);
        return { success: false, transactions: [] };
    }
};
