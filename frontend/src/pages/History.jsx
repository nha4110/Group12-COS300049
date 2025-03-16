{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { useState } from "react";
import { Container, Typography, Tabs, Tab, Box } from "@mui/material";
import { motion } from "framer-motion"; // For animations
import BalanceTransactionsHistory from "../component/BalanceTransactionsHistory";
import NFTTransactionsHistory from "../component/NFTTransactionsHistory";
import { History as HistoryIcon } from "@mui/icons-material"; // Icon for history

const History = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 4 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <Box
          sx={{
            background: "linear-gradient(135deg, #6e8efb, #a777e3)",
            borderRadius: 3,
            p: 4,
            textAlign: "center",
            color: "white",
            mb: 4,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}
          >
            <HistoryIcon /> Transaction History
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Review your past NFT and balance transactions.
          </Typography>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{
            bgcolor: "#ffffff",
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "1.1rem",
              color: "#7f8c8d",
              "&.Mui-selected": {
                color: "#6e8efb",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#6e8efb",
              height: 3,
            },
          }}
        >
          <Tab label="NFT Transactions" />
          <Tab label="Balance Transactions" />
        </Tabs>

        <motion.div
          key={tabValue}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mt: 3 }}>
            {tabValue === 0 && <NFTTransactionsHistory />}
            {tabValue === 1 && <BalanceTransactionsHistory />}
          </Box>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default History;