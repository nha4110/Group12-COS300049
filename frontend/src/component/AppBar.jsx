import React, { useState, useEffect, createContext, useContext } from "react";
import { AppBar, Box, Toolbar, IconButton, Typography, Avatar, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import { getWallet, createWallet, getBalance } from "../api/wallet";
import { useAuth } from "../scripts/AuthContext";
import { ethers } from "ethers";

// ✅ Create Wallet Context
const WalletContext = createContext();

// ✅ Wallet Provider
export const WalletProvider = ({ children }) => {
    const { state, dispatch } = useAuth();
    const [wallet, setWallet] = useState("");
    const [balance, setBalance] = useState("0 ETH");

    useEffect(() => {
        if (!state.user) return;

        const fetchWallet = async () => {
            try {
                const res = await getWallet(state.user.userId);
                if (res.success && res.walletAddress) {
                    setWallet(res.walletAddress);
                } else {
                    const newWallet = await createWallet();
                    if (newWallet.success) setWallet(newWallet.walletAddress);
                }
            } catch (error) {
                console.error("Error fetching wallet:", error);
            }
        };

        fetchWallet();
    }, [state.user]);

    useEffect(() => {
        const fetchBalance = async () => {
            if (!wallet) return;
            try {
                const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
                const balanceWei = await provider.getBalance(wallet);
                setBalance(`${ethers.formatEther(balanceWei)} ETH`);
            } catch (error) {
                console.error("Error fetching balance:", error);
            }
        };

        fetchBalance();
    }, [wallet]);

    return (
        <WalletContext.Provider value={{ wallet, balance, setWallet }}>
            {children}
        </WalletContext.Provider>
    );
};

// ✅ Custom hook to use wallet context
export const useWallet = () => useContext(WalletContext);

// ✅ Updated AppBar Component
export default function AppBarComponent() {
    const navigate = useNavigate();
    const { state, dispatch } = useAuth();
    const { wallet, balance } = useWallet();
    const user = state.user;

    // ✅ Logout Function
    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
        navigate("/login");
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    {/* Home Button */}
                    <IconButton size="large" edge="start" color="inherit" onClick={() => navigate("/")}>
                        <HomeIcon />
                    </IconButton>

                    {/* App Title */}
                    <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "left" }}>
                        NFT Marketplace
                    </Typography>

                    {/* Wallet Address & Balance Display */}
                    {user && (
                        <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: "white",
                                    textAlign: "right",
                                    fontSize: "0.9rem",
                                    maxWidth: "200px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    cursor: "pointer",
                                    mr: 2
                                }}
                                title={wallet} // Show full wallet on hover
                            >
                                {wallet ? wallet : "No Wallet"}
                            </Typography>
                            <Typography variant="body1" sx={{ color: "white", fontWeight: "bold" }}>
                                {balance}
                            </Typography>
                        </Box>
                    )}

                    {/* Profile Avatar & Logout */}
                    {user ? (
                        <>
                            <IconButton onClick={() => navigate("/profile")} sx={{ ml: { xs: 1, sm: 2 } }}>
                                <Avatar sx={{ bgcolor: "secondary.main" }}>
                                    {user.username.charAt(0).toUpperCase()}
                                </Avatar>
                            </IconButton>
                            <Button color="inherit" onClick={handleLogout} sx={{ ml: 2 }}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <IconButton onClick={() => navigate("/login")}>
                            <Avatar />
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>
        </Box>
    );
}
