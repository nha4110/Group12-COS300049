import React from "react";
import { Grid, Typography, Box, CircularProgress } from "@mui/material";
import NFTCard from "./NFTCard";

const NFTList = ({ nfts, loading, error, account, mintedStatus, mintNFT }) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  if (nfts.length === 0) {
    return (
      <Typography align="center">No available NFTs found. Check IPFS content or refresh.</Typography>
    );
  }

  return (
    <Grid container spacing={4}>
      {nfts.map((nft) => (
        <Grid item key={nft.id} xs={12} sm={6} md={4} lg={3}>
          <NFTCard
            nft={nft}
            account={account}
            mintedStatus={mintedStatus}
            mintNFT={mintNFT}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default NFTList;