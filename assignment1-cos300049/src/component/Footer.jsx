{/*
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Lu Nhat Hoang - 105234956
*/}

import React from "react";
import { Box, Container, Typography } from "@mui/material";

// Footer Component
export default function Footer() {
    return (
        <Box 
            component="footer" 
            sx={{ 
                bgcolor: "primary.dark",
                color: "white", 
                py: 2, // Adds vertical padding 
                textAlign: "center", // Centers text alignment
                mt: { xs: 10, sm: 25 }, // Increases top margin on larger screens
                px: { xs: 2, sm: 4 }, // Adds responsive horizontal padding
                wordWrap: "break-word", // Ensures text doesn't overflow
            }}
        >
            <Container>
                {/* Displays the current year dynamically */}
                <Typography variant="body2">
                    © {new Date().getFullYear()} NFT Marketplace
                </Typography>

                {/* Course name for assignment reference */}
                <Typography variant="body2">
                    Assignment for Blockchain Technology COS300049
                </Typography>

                {/* Contributors' names */}
                <Typography variant="body2">
                    Created by Lu Nhat Hoang, Nguyen Ngoc Huy Hoang, Chung Dung Toan
                </Typography>
            </Container>
        </Box>
    );
}
