import axios from "axios";
import Web3 from "web3";

const API_URL = "http://localhost:8081/wallet";

// ✅ Fetch user wallet address by accountId
export const getWallet = async (accountId) => {
    try {
        if (!accountId) throw new Error("Account ID is required.");
        const response = await axios.get(`${API_URL}/${accountId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching wallet:", error.response?.data || error.message);
        return { success: false, message: "Failed to fetch wallet." };
    }
};

// ✅ Fetch balance directly from blockchain (inspired by AppBar.jsx)
export async function getWalletBalance(walletAddress) {
    console.log(`🔍 Fetching balance for: ${walletAddress}`);
    try {
        if (!window.ethereum) throw new Error("MetaMask not detected");
        const web3 = new Web3(window.ethereum);
        const balanceWei = await web3.eth.getBalance(walletAddress);
        const balanceEth = web3.utils.fromWei(balanceWei, "ether");
        return { success: true, balance: parseFloat(balanceEth).toFixed(4) };
    } catch (error) {
        console.error("❌ Error fetching wallet balance:", error);
        return { success: false, message: "Failed to fetch balance." };
    }
}

// ✅ Create Wallet for a User
export const createWallet = async (userId) => {
    try {
        if (!userId) throw new Error("User ID is required.");
        const res = await axios.post(`${API_URL}/create`, { userId });
        return res.data;
    } catch (error) {
        console.error("❌ Error creating wallet:", error.response?.data || error.message);
        return { success: false, message: "Failed to create wallet." };
    }
};

export const sendTransaction = async (transactionData) => {
    try {
        const response = await fetch('/transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        throw error;
    }
};

// ✅ Get Transaction History
export const getTransactionHistory = async (walletAddress) => {
    try {
        if (!walletAddress) throw new Error("Wallet address is required.");
        const res = await axios.get(`${API_URL}/transactions/${walletAddress}`);
        return res.data;
    } catch (error) {
        console.error("❌ Error fetching transactions:", error.response?.data || error.message);
        return { success: false, transactions: [] };
    }
};