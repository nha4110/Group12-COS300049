{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React from "react";
import { Grid, Card, CardMedia, CardContent, Typography, Box } from "@mui/material";
import { motion } from "framer-motion"; // For animations

const NFTCard = ({ nft, onClick }) => (
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)" }}
    >
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          background: "linear-gradient(135deg, #ffffff, #f9f9f9)",
        }}
        onClick={onClick}
      >
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
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          />
        </Box>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: "bold", color: "#2c3e50" }}>
            {nft.name}
          </Typography>
          <Typography variant="body2" sx={{ color: "#7f8c8d", mb: 2 }}>
            {nft.description}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Token ID: {nft.id}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  </Grid>
);

export default NFTCard;