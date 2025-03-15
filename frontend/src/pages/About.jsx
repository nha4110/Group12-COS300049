import React from "react";
import { Box, Container, Typography, Grid, Card, CardContent, Avatar } from "@mui/material";

// Sample avatars (Replace with actual image URLs if available)
const members = [
    {
        name: "Lu Nhat Hoang",
        role: "Full-Stack Developer",
        description: "Expert in smart contracts and backend development. Built the blockchain integration for our marketplace.",
        avatar: "https://via.placeholder.com/100"
    },
    {
        name: "Nguyen Ngoc Huy Hoang",
        role: "Frontend Developer",
        description: "Specializes in UI/UX design and React development. Designed the user-friendly interface of our marketplace.",
        avatar: "https://via.placeholder.com/100"
    },
    {
        name: "Chung Dung Toan",
        role: "Blockchain Engineer",
        description: "Focused on Ethereum smart contract development and security auditing.",
        avatar: "https://via.placeholder.com/100"
    },
    {
        name: "Le Anh Tuan",
        role: "Project Manager",
        description: "Oversaw the project's timeline and coordinated team efforts to ensure smooth development.",
        avatar: "https://via.placeholder.com/100"
    },
];

export default function About() {
    return (
        <Container sx={{ py: 5 }}>
            <Typography variant="h3" align="center" gutterBottom>
                Meet the Team
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" paragraph>
                We are a group of blockchain enthusiasts dedicated to creating decentralized applications.
            </Typography>

            <Grid container spacing={4} justifyContent="center">
                {members.map((member, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card sx={{ textAlign: "center", p: 2 }}>
                            <Avatar src={member.avatar} sx={{ width: 80, height: 80, mx: "auto", mb: 2 }} />
                            <CardContent>
                                <Typography variant="h6">{member.name}</Typography>
                                <Typography variant="subtitle1" color="textSecondary">{member.role}</Typography>
                                <Typography variant="body2">{member.description}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}