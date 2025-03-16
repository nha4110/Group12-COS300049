{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
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
        if (response.data && response.data.balance) {
            return { success: true, balance: response.data.balance };
        }
        return { success: false, message: "Balance not found." };
    } catch (error) {
        console.error("❌ Error fetching wallet balance:", error);
        return { success: false, message: "Failed to fetch balance." };
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

export const sendTransaction = async (transactionData) => {
    try {
        const response = await fetch('/transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send transaction');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending transaction:', error);
        throw error; // Re-throw the error to be handled by the caller
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
