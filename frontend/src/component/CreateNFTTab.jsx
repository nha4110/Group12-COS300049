import React, { useState } from "react";
import { Paper, Typography, TextField, Button, Box, CircularProgress, Divider } from "@mui/material";
import { ethers } from "ethers";
import { uploadToPinata } from "../api/pinataService";
import { useNavigate } from "react-router-dom";
import contractData from "../../../backend/build/contracts/MyNFT.json";

const CONTRACT_ADDRESS = "0x84643357E0de364Acc9659021A1920362e1255D5";
const ABI = contractData.abi;
const PINATA_GATEWAY = "https://gray-magic-tortoise-619.mypinata.cloud/ipfs/";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8081";

const CreateNFTTab = ({ walletAddress, web3 }) => {
  const navigate = useNavigate();
  const [collectionName, setCollectionName] = useState("");
  const [nfts, setNfts] = useState([{ pngFile: null, name: "", description: "", jsonBlob: null }]);
  const [uploading, setUploading] = useState(false);
  const [baseCid, setBaseCid] = useState("");
  const [nextTokenId, setNextTokenId] = useState(1); // Start at 1 per collection

  const handlePngChange = (index, file) => {
    if (!file || !file.type.includes("image/png")) {
      alert("Please upload a valid PNG file.");
      return;
    }
    const newNfts = [...nfts];
    newNfts[index].pngFile = file;
    setNfts(newNfts);
  };

  const handleInputChange = (index, field, value) => {
    const newNfts = [...nfts];
    newNfts[index][field] = value;
    setNfts(newNfts);
  };

  const generateJson = (index) => {
    const nft = nfts[index];
    if (!nft.pngFile || !nft.name || !nft.description) {
      alert("Please upload a PNG and enter a name and description first.");
      return;
    }
    const tokenId = nextTokenId + index;
    const jsonData = {
      name: nft.name,
      description: nft.description,
      image: `${collectionName}/${tokenId}.png`,
    };
    const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const jsonFileName = `${tokenId}.json`;
    const newNfts = [...nfts];
    newNfts[index].jsonBlob = new File([jsonBlob], jsonFileName, { type: "application/json" });
    setNfts(newNfts);
  };

  const addMoreNFT = () => {
    setNfts([...nfts, { pngFile: null, name: "", description: "", jsonBlob: null }]);
  };

  const handleUploadCollection = async () => {
    if (!collectionName) {
      alert("Please enter a collection name.");
      return;
    }
    if (nfts.some(nft => !nft.pngFile || !nft.jsonBlob)) {
      alert("Please upload a PNG and generate JSON for all NFTs before uploading.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      nfts.forEach((nft, index) => {
        const tokenId = nextTokenId + index;
        const pngFile = new File([nft.pngFile], `${tokenId}.png`, { type: "image/png" });
        formData.append("file", pngFile, `${collectionName}/${tokenId}.png`);
        formData.append("file", nft.jsonBlob, `${collectionName}/${tokenId}.json`);
      });

      const uploadResponse = await uploadToPinata(formData, `${nextTokenId}_collection`, collectionName);
      if (!uploadResponse.IpfsHash) throw new Error("No IPFS hash returned");

      const newBaseCid = uploadResponse.IpfsHash;
      setBaseCid(newBaseCid);
      alert(`Collection uploaded successfully! Base CID: ${newBaseCid}`);

      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("Please log in first");

      const collectionData = {
        category: collectionName,
        creator: walletAddress,
        tokenIdStart: nextTokenId, // Match backend camelCase
        baseCid: newBaseCid,
        nftCount: nfts.length,
      };

      const response = await fetch(`${BACKEND_URL}/api/collections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(collectionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to save collection: ${errorData.message}`);
      }

      console.log("Collection saved:", collectionData);
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const mintNFT = async (index) => {
    if (!baseCid || !walletAddress) {
      alert("Please upload the collection and connect your wallet first.");
      return;
    }

    const tokenId = nextTokenId + index;
    const metadataURI = `${PINATA_GATEWAY}${baseCid}/${collectionName}/${tokenId}.json`;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.payToMint(walletAddress, metadataURI, tokenId, {
        value: ethers.parseEther("0.05"),
      });

      alert(`Minting NFT ${nfts[index].name} (Token ID: ${tokenId}) submitted...`);
      const receipt = await tx.wait();

      const token = localStorage.getItem("jwtToken");
      const transactionData = {
        hash: receipt.hash,
        from: walletAddress,
        to: CONTRACT_ADDRESS,
        amount: "0.05",
        gas: ethers.formatUnits(receipt.gasUsed, "ether"),
        date: new Date().toISOString(),
      };
      const assetData = {
        walletAddress,
        nftId: tokenId,
        nftName: nfts[index].name,
        price: "0.05",
        tokenID: tokenId,
        contractAddress: CONTRACT_ADDRESS,
        imageUrl: `${PINATA_GATEWAY}${baseCid}/${collectionName}/${tokenId}.png`,
        category: collectionName,
        txHash: receipt.hash,
        creator: walletAddress,
      };

      await Promise.all([
        fetch(`${BACKEND_URL}/api/transactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(transactionData),
        }),
        fetch(`${BACKEND_URL}/buy-nft`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(assetData),
        }),
      ]);

      alert(`NFT ${nfts[index].name} minted successfully!`);
      window.dispatchEvent(new Event("balanceUpdated"));
      window.dispatchEvent(new Event("nftCacheUpdated"));
      if (index === nfts.length - 1) {
        setCollectionName("");
        setNfts([{ pngFile: null, name: "", description: "", jsonBlob: null }]);
        setBaseCid("");
        setNextTokenId(nextTokenId + nfts.length); // Increment for next collection
        navigate("/home");
      }
    } catch (error) {
      console.error("Minting error:", error);
      alert(`Minting failed: ${error.message}`);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
      <Typography variant="h5" gutterBottom>
        Create Your NFT Collection
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Step 1: Name your collection and add NFTs. Step 2: Upload everything. Step 3: Mint your NFTs!
      </Typography>

      <TextField
        label="Collection Name (e.g., Earth Series)"
        fullWidth
        margin="normal"
        value={collectionName}
        onChange={(e) => setCollectionName(e.target.value)}
        helperText="Give your collection a unique name."
      />

      {nfts.map((nft, index) => (
        <Box key={index} sx={{ mt: 2, mb: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6">NFT #{index + 1}</Typography>
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Upload Image (PNG only)
          </Typography>
          <input
            type="file"
            accept="image/png"
            onChange={(e) => handlePngChange(index, e.target.files[0])}
            style={{ display: "block", marginBottom: "10px" }}
          />
          {nft.pngFile && (
            <>
              <TextField
                label="NFT Name (e.g., Evil Mark)"
                fullWidth
                margin="normal"
                value={nft.name}
                onChange={(e) => handleInputChange(index, "name", e.target.value)}
                helperText="Enter a catchy name for this NFT."
              />
              <TextField
                label="Description"
                fullWidth
                margin="normal"
                value={nft.description}
                onChange={(e) => handleInputChange(index, "description", e.target.value)}
                helperText="Describe your NFT (e.g., 'The name said it all')."
              />
              <Button
                variant="outlined"
                onClick={() => generateJson(index)}
                sx={{ mt: 1 }}
                disabled={!nft.pngFile || !nft.name || !nft.description}
              >
                Generate Metadata (JSON)
              </Button>
              {nft.jsonBlob && (
                <Typography variant="body2" sx={{ mt: 1, color: "green" }}>
                  Metadata ready: {nft.jsonBlob.name}
                </Typography>
              )}
            </>
          )}
          {baseCid && (
            <Button
              variant="contained"
              color="success"
              onClick={() => mintNFT(index)}
              sx={{ mt: 2 }}
              disabled={!nft.jsonBlob}
            >
              Mint NFT #{index + 1} (0.05 ETH)
            </Button>
          )}
        </Box>
      ))}

      <Button
        variant="contained"
        color="secondary"
        onClick={addMoreNFT}
        sx={{ mt: 2, mr: 2 }}
        disabled={uploading || nfts.some(nft => !nft.jsonBlob)}
      >
        Add Another NFT
      </Button>

      <Button
        variant="contained"
        color="primary"
        onClick={handleUploadCollection}
        sx={{ mt: 2 }}
        disabled={uploading || !collectionName || nfts.some(nft => !nft.pngFile || !nft.jsonBlob)}
      >
        {uploading ? <CircularProgress size={24} /> : "Upload Collection"}
      </Button>

      {baseCid && (
        <Typography variant="body2" sx={{ mt: 2, color: "green" }}>
          Collection Uploaded! Base CID: {baseCid} | Starting Token ID: {nextTokenId}
        </Typography>
      )}
    </Paper>
  );
};

export default CreateNFTTab;