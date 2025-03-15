import React, { useState, useEffect } from "react";
import { Paper, Typography, TextField, Button } from "@mui/material";
import { ethers } from "ethers";
import { uploadToPinata } from "../api/pinataService";
import { useNavigate } from "react-router-dom";
import contractData from "../../../backend/build/contracts/MyNFT.json";

const CONTRACT_ADDRESS = "0x84643357E0de364Acc9659021A1920362e1255D5";
const ABI = contractData.abi;
const FOLDER_NAME = "out";

const CreateNFTTab = ({ walletAddress, web3 }) => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [nextTokenId, setNextTokenId] = useState(null);

  useEffect(() => {
    fetchNextTokenId();
  }, []);

  const fetchNextTokenId = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const totalSupply = await contract.getTotalSupply();
      setNextTokenId(Number(totalSupply));
    } catch (error) {
      console.error("Error fetching next token ID:", error);
      setNextTokenId(60); // Fallback
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
    if (!selectedFile.type.includes("image/png")) {
      alert("Please upload a PNG file.");
      return;
    }

    setUploading(true);
    try {
      const fileName = `${nextTokenId}.png`;
      const hash = await uploadToPinata(selectedFile, fileName, FOLDER_NAME);
      if (hash) {
        setIpfsHash(hash);
        alert(`Image uploaded successfully! IPFS Hash: ${hash}`);
      } else {
        alert("Image upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const mintNFT = async () => {
    if (!ipfsHash || !nftName || !nextTokenId) {
      alert("Please upload a PNG image, provide a name, and ensure token ID is loaded.");
      return;
    }
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const metadata = {
        name: nftName,
        description: nftDescription || "No description provided.",
        image: `ipfs://${ipfsHash}`,
      };
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
      const metadataFile = new File([metadataBlob], `${nextTokenId}.json`);

      const metadataHash = await uploadToPinata(metadataFile, `${nextTokenId}.json`, FOLDER_NAME);
      if (!metadataHash) throw new Error("Failed to upload metadata");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const metadataURI = `ipfs://${metadataHash}`; // Use the metadata hash directly
      const tx = await contract.payToMint(walletAddress, metadataURI, nextTokenId, {
        value: ethers.parseEther("0.05"),
      });

      alert("Minting transaction submitted! Please wait for confirmation...");
      const receipt = await tx.wait();

      const transactionData = {
        hash: receipt.hash,
        from: walletAddress,
        to: CONTRACT_ADDRESS,
        amount: "0.05",
        gas: ethers.formatUnits(receipt.gasUsed, "ether"),
        date: new Date().toISOString(),
      };
      const assetData = {
        owner: walletAddress,
        tokenURI: metadataURI,
        name: nftName,
        description: nftDescription || "No description provided.",
        image: `ipfs://${ipfsHash}`,
      };

      const token = localStorage.getItem("jwtToken");
      await fetch(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:8081"}/api/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transactionData),
      });
      await fetch(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:8081"}/api/assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assetData),
      });

      alert("NFT minted successfully!");
      window.dispatchEvent(new Event("balanceUpdated"));
      window.dispatchEvent(new Event("nftCacheUpdated")); // Trigger Home.jsx refresh
      setNftName("");
      setNftDescription("");
      setIpfsHash("");
      setSelectedFile(null);
      setNextTokenId((prev) => prev + 1);
      navigate("/home");
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert(`Minting failed: ${error.message}`);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
      <Typography variant="h6">Create New NFT</Typography>
      <TextField
        label="NFT Name"
        fullWidth
        margin="normal"
        value={nftName}
        onChange={(e) => setNftName(e.target.value)}
      />
      <TextField
        label="NFT Description"
        fullWidth
        multiline
        rows={3}
        margin="normal"
        value={nftDescription}
        onChange={(e) => setNftDescription(e.target.value)}
      />
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Upload NFT Image (PNG only)
      </Typography>
      <input
        type="file"
        accept="image/png"
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2, mr: 1 }}
        onClick={handleFileUpload}
        disabled={uploading || !selectedFile}
      >
        {uploading ? "Uploading..." : "Upload Image"}
      </Button>
      {ipfsHash && (
        <>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Image Uploaded! IPFS Hash: {ipfsHash} (Next ID: {nextTokenId})
          </Typography>
          <Button
            variant="contained"
            color="success"
            sx={{ mt: 2 }}
            onClick={mintNFT}
            disabled={!nftName || !nextTokenId}
          >
            Mint NFT (0.05 ETH)
          </Button>
        </>
      )}
    </Paper>
  );
};

export default CreateNFTTab;