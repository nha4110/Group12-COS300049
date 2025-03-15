import React, { useState, useEffect } from "react";
import { 
  Container, Button, Typography, Grid, Card, CardMedia, CardContent,
  CircularProgress, Box, Chip, Stack, Fade
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { styled } from '@mui/material/styles';
import WalletIcon from "@mui/icons-material/AccountBalanceWallet";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const BACKEND_URL = "http://localhost:8081";
const PINATA_GATEWAY = "https://gray-magic-tortoise-619.mypinata.cloud/ipfs/";

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
  },
}));

const GradientHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
}));

const Home = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInWallet, setLoggedInWallet] = useState(null);

  useEffect(() => {
    const wallet = localStorage.getItem("wallet_address");
    setLoggedInWallet(wallet);
    checkConnection();
    fetchCollections();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) setAccount(accounts[0]);
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get(`${BACKEND_URL}/api/collections`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const fetchedCollections = response.data.map((col) => ({
        name: col.category,
        firstImage: `${PINATA_GATEWAY}${col.base_cid}/${col.category}/1.png`,
        fallbackImage: `${PINATA_GATEWAY}${col.base_cid}/1.png`,
        tokenIdStart: col.token_id_start,
        nftCount: col.nft_count,
      }));
      setCollections(fetchedCollections);
      if (fetchedCollections.length === 0) setError("No collections found.");
    } catch (error) {
      setError(`Failed to load collections: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) return alert("MetaMask not detected!");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (error) {
      alert("Failed to connect to MetaMask.");
    }
  };

  const handleImageError = (collection, e) => {
    if (e.target.src !== collection.fallbackImage) {
      e.target.src = collection.fallbackImage;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Header Section */}
      <GradientHeader>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Typography variant="h2" component="h1" color="white" fontWeight="bold">
            NFT Marketplace
          </Typography>
          <Typography variant="h5" color="white" sx={{ opacity: 0.9, maxWidth: '600px' }}>
            Discover, collect, and trade unique digital assets in a vibrant marketplace
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<TrendingUpIcon />}
            sx={{ mt: 2, bgcolor: 'white', color: '#2196F3', '&:hover': { bgcolor: '#f0f0f0' } }}
            onClick={() => navigate('/explore')}
          >
            Explore Now
          </Button>
        </Stack>
      </GradientHeader>

      {/* Wallet Status */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          {loggedInWallet && (
            <Chip
              icon={<WalletIcon />}
              label={`Connected: ${loggedInWallet.slice(0, 6)}...${loggedInWallet.slice(-4)}`}
              color="success"
              variant="outlined"
            />
          )}
          {!account ? (
            <Button
              variant="contained"
              startIcon={<WalletIcon />}
              onClick={connectMetaMask}
              sx={{ borderRadius: 20 }}
            >
              Connect Wallet
            </Button>
          ) : (
            <Chip
              label={`MetaMask: ${account.slice(0, 6)}...${account.slice(-4)}`}
              color="primary"
              variant="outlined"
            />
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchCollections}
            sx={{ borderRadius: 20 }}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Collections Grid */}
      <Fade in={!loading}>
        <Box>
          {error ? (
            <Typography color="error" align="center" sx={{ py: 4 }}>
              <ErrorOutlineIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> {error}
            </Typography>
          ) : collections.length === 0 ? (
            <Typography align="center" sx={{ py: 4 }}>
              No collections available yet
            </Typography>
          ) : (
            <Grid container spacing={4}>
              {collections.map((collection) => (
                <Grid item key={collection.name} xs={12} sm={6} md={4} lg={3}>
                  <StyledCard onClick={() => navigate(`/market/${collection.name}`)}>
                    <CardMedia
                      component="img"
                      image={collection.firstImage}
                      alt={collection.name}
                      onError={(e) => handleImageError(collection, e)}
                      sx={{ height: 220, objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {collection.name}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" mt={1}>
                        <Typography variant="body2" color="text.secondary">
                          {collection.nftCount} Items
                        </Typography>
                        <Chip
                          label={`ID: ${collection.tokenIdStart}`}
                          size="small"
                          color="primary"
                        />
                      </Stack>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Fade>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={60} />
        </Box>
      )}
    </Container>
  );
};

export default Home;