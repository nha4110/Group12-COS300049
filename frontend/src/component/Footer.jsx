{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React from "react";
import { Box, Container, Typography, Grid, Link, IconButton } from "@mui/material";
import { GitHub, Email, School, YouTube, Description, Assignment } from "@mui/icons-material";
import { motion } from "framer-motion";

// Custom Animated Icon Button
const AnimatedIconButton = ({ href, children, color }) => (
    <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
        <IconButton component={Link} href={href} target="_blank" rel="noopener" sx={{ color: color || "white" }}>
            {children}
        </IconButton>
    </motion.div>
);

// Footer Component
export default function Footer() {
    return (
        <Box 
            component="footer" 
            sx={{ 
                bgcolor: "#1e1e2f",  // Dark modern theme
                color: "#e0e0e0", 
                py: 4, 
                textAlign: "center",
                mt: { xs: 10, sm: 25 },
                px: { xs: 2, sm: 4 },
            }}
        >
            <Container>
                <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: "bold", mb: 2 }}>
                    NFT Marketplace
                </Typography>

                <Grid container spacing={4} justifyContent="center">
                    {/* GitHub Repository */}
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body1" fontWeight="bold" color="primary.light">GitHub Repository</Typography>
                        <AnimatedIconButton href="https://github.com/nha4110/Group12-COS300049" color="#f0db4f">
                            <GitHub fontSize="large" />
                        </AnimatedIconButton>
                    </Grid>

                    {/* Contributors */}
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body1" fontWeight="bold" color="secondary.light">Contributors</Typography>
                        <Typography variant="body2">⭐ Lu Nhat Hoang</Typography>
                        <Typography variant="body2">⭐ Nguyen Ngoc Huy Hoang</Typography>
                        <Typography variant="body2">⭐ Chung Dung Toan</Typography>
                        <Typography variant="body2">⭐ Le Anh Tuan</Typography>
                    </Grid>

                    {/* Contact Emails */}
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body1" fontWeight="bold" color="success.light">Contact Emails</Typography>
                        <Typography variant="body2">📧 Lu Nhat Hoang - <Link href="mailto:hoanglunhat31@gmail.com" color="inherit">hoanglunhat31@gmail.com</Link></Typography>
                        <Typography variant="body2">📧 Chung Dung Toan - <Link href="mailto:toanchungg@gmail.com" color="inherit">toanchungg@gmail.com</Link></Typography>
                        <Typography variant="body2">📧 Ng Ngoc Huy Hoang - <Link href="mailto:witherboss2015@gmail.com" color="inherit">witherboss2015@gmail.com</Link></Typography>
                        <Typography variant="body2">📧 Le Anh Tuan - <Link href="mailto:awerfast16@gmail.com" color="inherit">awerfast16@gmail.com</Link></Typography>
                    </Grid>

                    {/* Student IDs */}
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body1" fontWeight="bold" color="warning.light">Student IDs</Typography>
                        <Typography variant="body2"><School sx={{ mr: 1, verticalAlign: "middle" }} /> Lu Nhat Hoang - 105234956</Typography>
                        <Typography variant="body2"><School sx={{ mr: 1, verticalAlign: "middle" }} /> Nguyen Ngoc Huy Hoang - 105514373</Typography>
                        <Typography variant="body2"><School sx={{ mr: 1, verticalAlign: "middle" }} /> Chung Dung Toan - 105514412</Typography>
                        <Typography variant="body2"><School sx={{ mr: 1, verticalAlign: "middle" }} /> Le Anh Tuan - 105011586</Typography>
                    </Grid>

                    {/* Project Tutorial */}
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body1" fontWeight="bold" color="error.light">Project Navigation Tutorial</Typography>
                        <AnimatedIconButton href="https://www.youtube.com/" color="red">
                            <YouTube fontSize="large" />
                        </AnimatedIconButton>
                    </Grid>

                    {/* Documentation */}
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body1" fontWeight="bold" color="info.light">Project Documentation</Typography>
                        <AnimatedIconButton href="https://docs.google.com/document/d/1h8TQ1hHLwCZobZ8ze2el096YKTuzXiiP3awW7-NRz68/edit?tab=t.0#heading=h.j5hwtvu9l2pw" color="#4caf50">
                            <Description fontSize="large" />
                        </AnimatedIconButton>
                    </Grid>

                    {/* Assignments */}
                    <Grid item xs={12}>
                        <Typography variant="body1" fontWeight="bold" color="purple">Assignments</Typography>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Typography variant="body2" sx={{ color: "#ffcc00" }}><Assignment sx={{ mr: 1, verticalAlign: "middle" }} /> Assignment 1</Typography>
                            <Typography variant="body2" sx={{ color: "#ff5722" }}><Assignment sx={{ mr: 1, verticalAlign: "middle" }} /> Assignment 2</Typography>
                            <Typography variant="body2" sx={{ color: "#26a69a" }}><Assignment sx={{ mr: 1, verticalAlign: "middle" }} /> Assignment 3</Typography>
                        </motion.div>
                    </Grid>
                </Grid>

                <Typography variant="body2" sx={{ mt: 3, color: "#bdbdbd" }}>
                    © {new Date().getFullYear()} NFT Marketplace | Assignment for Blockchain Technology COS300049
                </Typography>
            </Container>
        </Box>
    );
}
