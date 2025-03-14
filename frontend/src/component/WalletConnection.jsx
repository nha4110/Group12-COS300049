import React from "react";
import { Typography, Button, Box } from "@mui/material";

const WalletConnection = ({ account, connectMetaMask, shortenAddress }) => {
  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
      {account ? (
        <Typography variant="body1">
          Connected: {shortenAddress(account)}
        </Typography>
      ) : (
        <Button variant="contained" onClick={connectMetaMask}>
          Connect MetaMask
        </Button>
      )}
    </Box>
  );
};

export default WalletConnection;