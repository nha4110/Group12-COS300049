import React, { useState, useEffect } from "react";
import { Paper, Typography, TextField, Button } from "@mui/material";
import { ethers } from "ethers";
import { uploadToPinata } from "../api/pinataService";
import { useNavigate } from "react-router-dom";
import contractData from "../../../backend/build/contracts/MyNFT.json";

const CONTRACT_ADDRESS = "0x84643357E0de364Acc9659021A1920362e1255D5";
const ABI = contractData.abi;

const CreateNFTTab = ({ walletAddress, web3 }) => {
  const navigate = useNavigate();
  const [collectionName, setCollectionName] = useState("");
  const [pngFile, setPngFile] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");
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
    if (!collectionName || !pngFile || !jsonFile) {
      alert("Please provide a collection name and upload both a PNG and a JSON file.");
      return;
    }
    if (!pngFile.type.includes("image/png")) {
      alert("Please upload a PNG file for the image.");
      return;
    }
    if (!jsonFile.type.includes("application/json")) {
      alert("Please upload a JSON file for the metadata.");
      return;
    }

    setUploading(true);
    try {
      const pngFileName = `${nextTokenId}.png`;
      const jsonFileName = `${nextTokenId}.json`;
      const pngHash = await uploadToPinata(pngFile, pngFileName, collectionName);
      const jsonHash = await uploadToPinata(jsonFile, jsonFileName, collectionName);

      if (pngHash && jsonHash) {
        setIpfsHash(jsonHash); // Use JSON hash as the primary IPFS hash for minting
        alert(`Collection files uploaded successfully! PNG Hash: ${pngHash}, JSON Hash: ${jsonHash}`);

        // Save collection metadata to the backend
        const token = localStorage.getItem("jwtToken");
        const collectionData = {
          category: collectionName,
          creator: walletAddress,
          tokenIdStart: nextTokenId,
          pngHash,
          jsonHash,
        };
        await fetch(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:8081"}/api/collections`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(collectionData),
        });
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const mintNFT = async () => {
    if (!ipfsHash || !collectionName || !nextTokenId) {
      alert("Please upload files, provide a collection name, and ensure token ID is loaded.");
      return;
    }
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const metadataURI = `ipfs://${ipfsHash}`;
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
        name: collectionName,
        image: `ipfs://${ipfsHash.replace(".json", ".png")}`,
        category: collectionName,
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
      window.dispatchEvent(new Event("nftCacheUpdated"));
      setCollectionName("");
      setPngFile(null);
      setJsonFile(null);
      setIpfsHash("");
      setNextTokenId((prev) => prev + 1);
      navigate("/home");
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert(`Minting failed: ${error.message}`);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
      <Typography variant="h6">Create New NFT Collection</Typography>
      <TextField
        label="Collection Name"
        fullWidth
        margin="normal"
        value={collectionName}
        onChange={(e) => setCollectionName(e.target.value)}
      />
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Upload NFT Image (PNG only)
      </Typography>
      <input
        type="file"
        accept="image/png"
        onChange={(e) => setPngFile(e.target.files[0])}
      />
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Upload NFT Metadata (JSON only)
      </Typography>
      <input
        type="file"
        accept="application/json"
        onChange={(e) => setJsonFile(e.target.files[0])}
      />
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2, mr: 1 }}
        onClick={handleFileUpload}
        disabled={uploading || !pngFile || !jsonFile}
      >
        {uploading ? "Uploading..." : "Upload Collection"}
      </Button>
      {ipfsHash && (
        <>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Collection Uploaded! IPFS Hash: {ipfsHash} (Next ID: {nextTokenId})
          </Typography>
          <Button
            variant="contained"
            color="success"
            sx={{ mt: 2 }}
            onClick={mintNFT}
            disabled={!collectionName || !nextTokenId}
          >
            Mint First NFT (0.05 ETH)
          </Button>
        </>
      )}
    </Paper>
  );
};

export default CreateNFTTab;