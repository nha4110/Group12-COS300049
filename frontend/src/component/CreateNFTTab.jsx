{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { useState } from "react"; // React hook for state management
import { Paper, Typography, TextField, Button, Box, CircularProgress, Divider } from "@mui/material"; // Material-UI components
import { uploadToPinata } from "../api/pinataService"; // API function to upload to Pinata (IPFS)
import { useNavigate } from "react-router-dom"; // Hook for navigation

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8081"; // Backend URL with fallback

const CreateNFTTab = ({ walletAddress }) => {
  const navigate = useNavigate(); // Navigation function
  const [collectionName, setCollectionName] = useState(""); // State for collection name
  const [nfts, setNfts] = useState([{ pngFile: null, name: "", description: "", jsonBlob: null }]); // State for NFT data
  const [uploading, setUploading] = useState(false); // State to track upload status
  const [baseCid, setBaseCid] = useState(""); // State for IPFS base CID
  const [nextTokenId, setNextTokenId] = useState(1); // State for starting token ID of the collection

  // Handle PNG file selection for an NFT
  const handlePngChange = (index, file) => {
    if (!file || !file.type.includes("image/png")) {
      alert("Please upload a valid PNG file."); // Validate file type
      return;
    }
    const newNfts = [...nfts];
    newNfts[index].pngFile = file; // Update PNG file for the specific NFT
    setNfts(newNfts);
  };

  // Handle changes to NFT name or description
  const handleInputChange = (index, field, value) => {
    const newNfts = [...nfts];
    newNfts[index][field] = value; // Update specified field for the NFT
    setNfts(newNfts);
  };

  // Generate JSON metadata for an NFT
  const generateJson = (index) => {
    const nft = nfts[index];
    if (!nft.pngFile || !nft.name || !nft.description) {
      alert("Please upload a PNG and enter a name and description first."); // Validate required fields
      return;
    }
    const tokenId = nextTokenId + index; // Calculate token ID
    const jsonData = {
      name: nft.name,
      description: nft.description,
      image: `${collectionName}/${tokenId}.png`, // Image path for IPFS
    };
    const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" }); // Create JSON blob
    const jsonFileName = `${tokenId}.json`;
    const newNfts = [...nfts];
    newNfts[index].jsonBlob = new File([jsonBlob], jsonFileName, { type: "application/json" }); // Add JSON file to NFT
    setNfts(newNfts);
  };

  // Add a new empty NFT to the collection
  const addMoreNFT = () => {
    setNfts([...nfts, { pngFile: null, name: "", description: "", jsonBlob: null }]);
  };

  // Upload the entire collection to IPFS and save to backend
  const handleUploadCollection = async () => {
    if (!collectionName) {
      alert("Please enter a collection name."); // Validate collection name
      return;
    }
    if (nfts.some((nft) => !nft.pngFile || !nft.jsonBlob)) {
      alert("Please upload a PNG and generate JSON for all NFTs before uploading."); // Validate all NFTs
      return;
    }

    setUploading(true); // Set uploading state to true
    try {
      const formData = new FormData(); // Create form data for upload
      nfts.forEach((nft, index) => {
        const tokenId = nextTokenId + index;
        const pngFile = new File([nft.pngFile], `${tokenId}.png`, { type: "image/png" }); // Rename PNG file
        formData.append("file", pngFile, `${collectionName}/${tokenId}.png`); // Add PNG to form data
        formData.append("file", nft.jsonBlob, `${collectionName}/${tokenId}.json`); // Add JSON to form data
      });

      const uploadResponse = await uploadToPinata(formData, `${nextTokenId}_collection`, collectionName); // Upload to Pinata
      if (!uploadResponse.IpfsHash) throw new Error("No IPFS hash returned"); // Check for IPFS hash

      const newBaseCid = uploadResponse.IpfsHash; // Store IPFS base CID
      setBaseCid(newBaseCid);
      alert(`Collection uploaded successfully! Base CID: ${newBaseCid}`);

      const token = localStorage.getItem("jwtToken"); // Get JWT token from local storage
      if (!token) throw new Error("Please log in first"); // Validate token

      const collectionData = {
        category: collectionName,
        creator: walletAddress,
        tokenIdStart: nextTokenId, // Match backend camelCase
        baseCid: newBaseCid,
        nftCount: nfts.length,
      };

      // Save collection to backend
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
        throw new Error(`Failed to save collection: ${errorData.message}`); // Handle backend error
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
      setUploading(false); // Reset uploading state
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
      <Typography variant="h5" gutterBottom>
        Create Your NFT Collection {/* Title */}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Step 1: Name your collection and add NFTs. Step 2: Upload everything to IPFS and save to the database! {/* Instructions */}
      </Typography>

      <TextField
        label="Collection Name (e.g., Earth Series)"
        fullWidth
        margin="normal"
        value={collectionName}
        onChange={(e) => setCollectionName(e.target.value)} // Update collection name
        helperText="Give your collection a unique name."
      />

      {nfts.map((nft, index) => (
        <Box key={index} sx={{ mt: 2, mb: 3 }}>
          <Divider sx={{ mb: 2 }} /> {/* Separator */}
          <Typography variant="h6">NFT #{index + 1}</Typography>
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Upload Image (PNG only) {/* Image upload prompt */}
          </Typography>
          <input
            type="file"
            accept="image/png"
            onChange={(e) => handlePngChange(index, e.target.files[0])} // Handle file selection
            style={{ display: "block", marginBottom: "10px" }}
          />
          {nft.pngFile && (
            <>
              <TextField
                label="NFT Name (e.g., Evil Mark)"
                fullWidth
                margin="normal"
                value={nft.name}
                onChange={(e) => handleInputChange(index, "name", e.target.value)} // Update NFT name
                helperText="Enter a catchy name for this NFT."
              />
              <TextField
                label="Description"
                fullWidth
                margin="normal"
                value={nft.description}
                onChange={(e) => handleInputChange(index, "description", e.target.value)} // Update NFT description
                helperText="Describe your NFT (e.g., 'The name said it all')."
              />
              <Button
                variant="outlined"
                onClick={() => generateJson(index)} // Generate JSON metadata
                sx={{ mt: 1 }}
                disabled={!nft.pngFile || !nft.name || !nft.description} // Disable if fields are incomplete
              >
                Generate Metadata (JSON)
              </Button>
              {nft.jsonBlob && (
                <Typography variant="body2" sx={{ mt: 1, color: "green" }}>
                  Metadata ready: {nft.jsonBlob.name} {/* Confirmation of JSON generation */}
                </Typography>
              )}
            </>
          )}
        </Box>
      ))}

      <Button
        variant="contained"
        color="secondary"
        onClick={addMoreNFT} // Add another NFT to the collection
        sx={{ mt: 2, mr: 2 }}
        disabled={uploading || nfts.some((nft) => !nft.jsonBlob)} // Disable during upload or if JSON is missing
      >
        Add Another NFT
      </Button>

      <Button
        variant="contained"
        color="primary"
        onClick={handleUploadCollection} // Upload the collection
        sx={{ mt: 2 }}
        disabled={uploading || !collectionName || nfts.some((nft) => !nft.pngFile || !nft.jsonBlob)} // Disable if conditions not met
      >
        {uploading ? <CircularProgress size={24} /> : "Upload Collection"} {/* Show loading spinner or text */}
      </Button>

      {baseCid && (
        <Typography variant="body2" sx={{ mt: 2, color: "green" }}>
          Collection Uploaded! Base CID: {baseCid} | Starting Token ID: {nextTokenId} {/* Upload success message */}
        </Typography>
      )}
    </Paper>
  );
};

export default CreateNFTTab;
