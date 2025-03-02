import axios from "axios";

const API_BASE_URL = "http://localhost:8081"; // Update if deployed

export const getCollections = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/collections`);
        return response.data.collections || [];
    } catch (error) {
        console.error("❌ Error fetching collections:", error.response?.data || error.message);
        return [];
    }
};

export const getNFTsByCategory = async (category) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/nfts/${category}`);
        return response.data.nfts || [];
    } catch (error) {
        console.error(`❌ Error fetching NFTs for ${category}:`, error.response?.data || error.message);
        return [];
    }
};
