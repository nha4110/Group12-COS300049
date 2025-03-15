import React, { createContext, useContext, useState, useEffect } from "react";
import { getWalletBalance } from "../api/wallet"; // Correct API import
import { useAuth } from "./AuthContext"; // Import useAuth to get the user wallet address

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
    const { state } = useAuth(); // Access the Auth state to get the user info
    const [balance, setBalance] = useState("0.0000");
    const [walletAddress, setWalletAddress] = useState(state?.user?.wallet_address || null); // Initialize walletAddress with user's wallet

    // Fetch balance when wallet address changes
    useEffect(() => {
        const fetchBalance = async () => {
            if (walletAddress) {
                try {
                    const response = await getWalletBalance(walletAddress);
                    if (response.success) {
                        setBalance(response.balance || "0.0000");
                    }
                } catch (error) {
                    console.error("❌ Error fetching balance:", error);
                    setBalance("0.0000");
                }
            }
        };

        if (walletAddress) {
            fetchBalance();
        }
    }, [walletAddress]); // Effect runs when wallet address changes

    // Update wallet address (called during login or wallet change)
    const updateWalletAddress = (newAddress) => {
        setWalletAddress(newAddress);
    };

    return (
        <BalanceContext.Provider value={{ balance, updateWalletAddress }}>
            {children}
        </BalanceContext.Provider>
    );
};

// Custom hook to access balance and wallet address
export const useBalance = () => {
    return useContext(BalanceContext);
};
