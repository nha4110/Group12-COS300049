{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { createContext, useContext, useState, useEffect } from "react";
import { getWalletBalance, getWallet } from "../api/wallet";
import { useAuth } from "./AuthContext";

// ✅ Create Wallet Context
const WalletContext = createContext();

// ✅ Wallet Provider to manage wallet state
export const WalletProvider = ({ children }) => {
    const { state } = useAuth(); // Get logged-in user
    const [wallet, setWallet] = useState(null);
    const [balance, setBalance] = useState(0);

    // ✅ Fetch Wallet when user logs in
    useEffect(() => {
        const fetchWallet = async () => {
            if (state?.user?.accountId) {
                try {
                    const data = await getWallet(state.user.accountId);
                    if (data.success && data.walletAddress) {
                        setWallet(data.walletAddress);
                    } else {
                        setWallet(null); // No wallet found
                    }
                } catch (error) {
                    console.error("❌ Error fetching wallet:", error);
                    setWallet(null);
                }
            }
        };
        fetchWallet();
    }, [state?.user]);

    // ✅ Fetch ETH Balance from Ganache
    useEffect(() => {
        const fetchBalance = async () => {
            if (wallet) {
                try {
                    const data = await getWalletBalance(wallet);
                    if (data.success) {
                        setBalance(parseFloat(data.balance));
                    } else {
                        setBalance(0); // Default balance
                    }
                } catch (error) {
                    console.error("❌ Error fetching balance:", error);
                    setBalance(0);
                }
            }
        };
        fetchBalance();
    }, [wallet]);

    return (
        <WalletContext.Provider value={{ wallet, balance }}>
            {children}
        </WalletContext.Provider>
    );
};

// ✅ Custom Hook to use Wallet Context
export const useWallet = () => useContext(WalletContext);
