import React, { useState } from "react";
import { Paper, Typography, TextField, Button } from "@mui/material";
import { ethers } from "ethers";
import { uploadToPinata } from "../api/pinataService";
import { useNavigate } from "react-router-dom";
import contractData from "../../../backend/build/contracts/MyNFT.json";

const CONTRACT_ADDRESS = "0xA3e8472Eb803c5478F476175167b6c48Bf5eF530";
const ABI = contractData.abi;

const CreateNFTTab = ({ walletAddress, web3 }) => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
    setUploading(true);
    try {
      const fileName = selectedFile.name;
      const hash = await uploadToPinata(selectedFile, fileName);
      if (hash) {
        setIpfsHash(hash);
        alert(`Upload successful! IPFS Hash: ${hash}`);
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed.");
    }
    setUploading(false);
  };

  const mintNFT = async () => {
    if (!ipfsHash || !nftName) {
      alert("Please upload an image and provide a name for your NFT");
      return;
    }
    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }
    try {
      const metadata = {
        name: nftName,
        description: nftDescription,
        image: `ipfs://${ipfsHash}`,
      };
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
      const metadataFile = new File([metadataBlob], "metadata.json");

      const metadataHash = await uploadToPinata(metadataFile, "metadata.json");
      if (!metadataHash) throw new Error("Failed to upload metadata");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const metadataURI = `ipfs://${metadataHash}`;
      const tx = await contract.payToMint(walletAddress, metadataURI, {
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
        description: nftDescription,
        image: `ipfs://${ipfsHash}`,
      };

      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });
      await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assetData),
      });

      alert("NFT minted successfully!");
      setNftName("");
      setNftDescription("");
      setIpfsHash("");
      setSelectedFile(null);
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
      <Typography variant="subtitle1" sx={{ mt: 2 }}>Upload NFT Image</Typography>
      <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
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
            Image Uploaded! IPFS Hash: {ipfsHash}
          </Typography>
          <Button
            variant="contained"
            color="success"
            sx={{ mt: 2 }}
            onClick={mintNFT}
            disabled={!nftName}
          >
            Mint NFT (0.05 ETH)
          </Button>
        </>
      )}
    </Paper>
  );
};

export default CreateNFTTab;