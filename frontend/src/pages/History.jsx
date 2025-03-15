import React, { useState } from "react";
import { Container, Typography, Tabs, Tab, Box } from "@mui/material";
import BalanceTransactionsHistory from "../component/BalanceTransactionsHistory";
import NFTTransactionsHistory from "../component/NFTTransactionsHistory"; // New component

const History = () => {
  const [tabValue, setTabValue] = useState(0);


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };


  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ textAlign: "center", marginTop: 4, fontWeight: "bold" }}>
        Transaction History
      </Typography>
      <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ marginTop: 3 }}>
        <Tab label="NFT Transactions" />
        <Tab label="Balance Transactions" />
      </Tabs>
      <Box sx={{ marginTop: 3 }}>
        {tabValue === 0 && <NFTTransactionsHistory />}
        {tabValue === 1 && <BalanceTransactionsHistory />}
      </Box>
    </Container>
  );
};

export default History;