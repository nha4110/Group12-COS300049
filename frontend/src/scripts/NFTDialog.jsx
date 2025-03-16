import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, Grid, Typography, Button, Box } from "@mui/material";
import { ethers } from "ethers";
import { motion } from "framer-motion"; // For animations
import contractData from "../../../backend/build/contracts/MyNFT.json";
import { ShoppingCart } from "@mui/icons-material"; // Icon for buy button

const CONTRACT_ADDRESS = "0x84643357E0de364Acc9659021A1920362e1255D5";
const ABI = contractData.abi;
const PINATA_GATEWAY = "https://gray-magic-tortoise-619.mypinata.cloud/ipfs/";

const NFTDialog = ({ open, onClose, nft, account, creator, collectionName, mintNFT, mintedStatus }) => {
  const [balance, setBalance] = useState(null);
  const [gasEstimate, setGasEstimate] = useState(null);

  useEffect(() => {
    if (open && account) {
      fetchBalanceAndGas();
    }
  }, [open, account]);

  const fetchBalanceAndGas = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const balanceWei = await provider.getBalance(account);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(balanceEth);

      const metadataURI = `${PINATA_GATEWAY}${nft.base_cid}/${nft.id}.json`;
      const gas = await contract.payToMint.estimateGas(account, metadataURI, nft.id, {
        value: ethers.parseEther("0.05"),
      });
      let gasPrice;
      try {
        const feeData = await provider.getFeeData();
        gasPrice = feeData.gasPrice || ethers.parseUnits("2", "gwei");
      } catch (feeError) {
        console.warn("Failed to fetch fee data, using default gas price:", feeError.message);
        gasPrice = ethers.parseUnits("2", "gwei");
      }
      const gasCostWei = gas * gasPrice;
      const gasCostEth = ethers.formatEther(gasCostWei);
      setGasEstimate(gasCostEth);
    } catch (error) {
      console.error("Error fetching balance/gas:", error);
      setBalance("Error");
      setGasEstimate("Error");
    }
  };

  const handleMint = async () => {
    const success = await mintNFT(nft.id);
    if (success) onClose();
  };

  const displayCreator = creator && creator !== "Unknown" ? creator : "Anonymous";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)", background: "linear-gradient(135deg, #ffffff, #f0f4ff)" },
      }}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <DialogTitle sx={{ bgcolor: "#6e8efb", color: "white", fontWeight: "bold", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          {nft.name}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: "relative", pt: "100%", borderRadius: 2, overflow: "hidden", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
                <img
                  src={nft.image}
                  alt={nft.name}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2c3e50", mb: 2 }}>
                Details
              </Typography>
              <Typography sx={{ color: "#34495e" }}>
                <strong>Name:</strong> {nft.name}
              </Typography>
              <Typography sx={{ color: "#34495e" }}>
                <strong>Description:</strong> {nft.description}
              </Typography>
              <Typography sx={{ color: "#34495e" }}>
                <strong>Token ID:</strong> {nft.id}
              </Typography>
              <Typography sx={{ color: "#34495e" }}>
                <strong>Price:</strong> 0.05 ETH
              </Typography>
              <Typography sx={{ color: "#34495e" }}>
                <strong>Gas Estimate:</strong> {gasEstimate ? `${parseFloat(gasEstimate).toFixed(6)} ETH` : "Calculating..."}
              </Typography>
              <Typography sx={{ color: "#34495e" }}>
                <strong>Current Balance:</strong> {balance ? `${parseFloat(balance).toFixed(6)} ETH` : "Fetching..."}
              </Typography>
              <Typography sx={{ color: "#27ae60" }}>
                <strong>Balance After:</strong>{" "}
                {balance && gasEstimate
                  ? (parseFloat(balance) - 0.05 - parseFloat(gasEstimate)).toFixed(6) + " ETH"
                  : "N/A"}
              </Typography>
              <Typography sx={{ color: "#34495e" }}>
                <strong>Creator:</strong> {displayCreator}
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleMint}
                  disabled={!account || mintedStatus[nft.id]}
                  sx={{
                    background: "linear-gradient(90deg, #6e8efb, #a777e3)",
                    "&:hover": { background: "linear-gradient(90deg, #5d78e6, #9366d2)" },
                    "&:disabled": { bgcolor: "#bdc3c7" },
                    borderRadius: 2,
                    py: 1.5,
                  }}
                  startIcon={<ShoppingCart />}
                >
                  {mintedStatus[nft.id] ? "Minted/Owned" : "Buy NFT (0.05 ETH)"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </motion.div>
    </Dialog>
  );
};

export default NFTDialog;