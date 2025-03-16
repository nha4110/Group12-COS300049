import React from "react";
import { Card, CardMedia, CardContent, Typography, Box } from "@mui/material";
import { motion } from "framer-motion"; // For animations

const CollectionCard = ({ collection, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card
      sx={{ height: "100%", display: "flex", flexDirection: "column", cursor: "pointer", boxShadow: 3 }}
      onClick={onClick}
    >
      <Box sx={{ position: "relative", pt: "100%" }}>
        <CardMedia
          component="img"
          image={collection.image}
          alt={collection.name}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          {collection.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {collection.nftCount} NFTs
        </Typography>
      </CardContent>
    </Card>
  </motion.div>
);

export default CollectionCard;