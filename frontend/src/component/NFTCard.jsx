import React from "react";
import { Card, CardMedia, CardContent, Typography, Button, Box } from "@mui/material";

const NFTCard = ({ nft, account, mintedStatus, mintNFT }) => {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ position: "relative", pt: "100%" }}>
        <CardMedia
          component="img"
          image={nft.image}
          alt={nft.name}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          onError={(e) => {
            e.target.src = nft.pngPath;
            e.target.onerror = () => {
              e.target.src = nft.svgPath;
              e.target.onerror = () => {
                e.target.src = "https://via.placeholder.com/400?text=Image+Not+Found";
              };
            };
          }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          {nft.name}
        </Typography>
        <Typography>{nft.description}</Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" display="block" color="text.secondary">
            Token ID: {nft.id}
          </Typography>
        </Box>
      </CardContent>
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => mintNFT(nft.id)}
          disabled={!account || mintedStatus[nft.id]}
        >
          {mintedStatus[nft.id] ? "Minted/Owned" : "Mint NFT (0.05 ETH)"}
        </Button>
      </Box>
    </Card>
  );
};

export default NFTCard;