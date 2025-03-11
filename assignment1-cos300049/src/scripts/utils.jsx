{/*
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Lu Nhat Hoang -  105234956
*/ }
import { useState, useEffect } from "react";
import nftData from "./nftData"; 
// import data needed 

export function useNFTCollections() {
    const [collections, setCollections] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            console.log("✅ NFT Data Loaded:", nftData);
            setCollections(nftData);
        } catch (err) {
            console.error("❌ Error loading NFTs:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    return { collections, loading, error };
} // ✅  fetch NFT collections from nftData use in other files


// this files is use to put fucltion that can be use in multiple files in this and future project

