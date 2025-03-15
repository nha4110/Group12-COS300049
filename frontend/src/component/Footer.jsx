{/*
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Lu Nhat Hoang - 105234956
*/}

import React from "react";
import { Box, Container, Typography, Grid, Link, Divider } from "@mui/material";
import YouTubeIcon from "@mui/icons-material/YouTube";
import GitHubIcon from "@mui/icons-material/GitHub";
import ArticleIcon from "@mui/icons-material/Article";
import InfoIcon from "@mui/icons-material/Info";

export default function Footer() {
    return (
        <Box 
            component="footer" 
            sx={{ 
                bgcolor: "primary.dark",
                color: "white", 
                py: 4, 
                textAlign: "center",
                mt: { xs: 10, sm: 25 },
                px: { xs: 2, sm: 4 },
                wordWrap: "break-word",
            }}
        >
            <Container>
                {/* Main Footer Grid Layout */}
                <Grid container spacing={3} justifyContent="center">
                    {/* Left Section - About */}
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6">NFT Marketplace</Typography>
                        <Typography variant="body2">
                            Empowering blockchain technology for a decentralized future.
                        </Typography>
                    </Grid>

                    {/* Middle Section - Links */}
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6">Resources</Typography>
                        <Link href="/about" color="inherit" display="block" underline="hover">
                            <InfoIcon fontSize="small" /> About Us
                        </Link>
                        <Link href="https://github.com/your-repo-link" target="_blank" color="inherit" display="block" underline="hover">
                            <GitHubIcon fontSize="small" /> GitHub Repository
                        </Link>
                        <Link href="https://docs.google.com/document/d/your-doc-link" target="_blank" color="inherit" display="block" underline="hover">
                            <ArticleIcon fontSize="small" /> Project Documentation
                        </Link>
                        <Link href="https://www.youtube.com/watch?v=your-video-link" target="_blank" color="inherit" display="block" underline="hover">
                            <YouTubeIcon fontSize="small" /> Demo Video
                        </Link>
                    </Grid>

                    {/* Right Section - Contributors */}
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6">Contributors</Typography>
                        <Typography variant="body2">
                            Lu Nhat Hoang, Nguyen Ngoc Huy Hoang, Chung Dung Toan, Le Anh Tuan
                        </Typography>
                    </Grid>
                </Grid>

                {/* Horizontal Divider */}
                <Divider sx={{ my: 3, bgcolor: "white" }} />

                {/* Bottom Section */}
                <Typography variant="body2">
                    © {new Date().getFullYear()} NFT Marketplace | Blockchain Technology COS30049
                </Typography>
            </Container>
        </Box>
    );
}
