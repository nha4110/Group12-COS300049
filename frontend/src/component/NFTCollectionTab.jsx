import React from "react";
import { Paper, Typography } from "@mui/material";

const NFTCollectionTab = () => {
  return (
    <Paper elevation={3} sx={{ padding: 3, marginTop: 2 }}>
      <Typography variant="h6" gutterBottom>NFT Collection</Typography>
      <Typography>Coming soon! Your owned NFTs will be displayed here.</Typography>
    </Paper>
  );
};

export default NFTCollectionTab;