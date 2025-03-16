import React, { useState } from "react";
import { Paper, Typography, TextField, Button, Box, CircularProgress, Divider } from "@mui/material";
import { uploadToPinata } from "../api/pinataService";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8081";

const CreateNFTTab = ({ walletAddress }) => {
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
    if (nfts.some((nft) => !nft.pngFile || !nft.jsonBlob)) {
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

      // Reset state and refresh the page
      setCollectionName("");
      setNfts([{ pngFile: null, name: "", description: "", jsonBlob: null }]);
      setBaseCid("");
      setNextTokenId(nextTokenId + nfts.length); // Increment for next collection
      window.location.reload(); // Ctrl + R equivalent
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
      <Typography variant="h5" gutterBottom>
        Create Your NFT Collection
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Step 1: Name your collection and add NFTs. Step 2: Upload everything to IPFS and save to the database!
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
        </Box>
      ))}

      <Button
        variant="contained"
        color="secondary"
        onClick={addMoreNFT}
        sx={{ mt: 2, mr: 2 }}
        disabled={uploading || nfts.some((nft) => !nft.jsonBlob)}
      >
        Add Another NFT
      </Button>

      <Button
        variant="contained"
        color="primary"
        onClick={handleUploadCollection}
        sx={{ mt: 2 }}
        disabled={uploading || !collectionName || nfts.some((nft) => !nft.pngFile || !nft.jsonBlob)}
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