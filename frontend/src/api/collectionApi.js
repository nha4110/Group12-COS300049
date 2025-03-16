import axios from "axios";

const BACKEND_URL = "http://localhost:8081";
const PINATA_GATEWAY = "https://gray-magic-tortoise-619.mypinata.cloud/ipfs/";
const CACHE_KEY = "home_collections_cache";

export const loadCollectionsFromCacheOrFetch = (setCollections, setLoading, fetchCollections) => {
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (cachedData) {
    const { collections, timestamp } = JSON.parse(cachedData);
    const cacheAge = Date.now() - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 1 day
    if (cacheAge < maxAge) {
      setCollections(collections);
      setLoading(false);
      return;
    }
  }
  fetchCollections();
};

export const saveToCache = (collectionsData) => {
  const cacheData = {
    collections: collectionsData,
    timestamp: Date.now(),
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
};

export const fetchCollections = async (setCollections, setLoading, setError) => {
  setLoading(true);
  setError(null);
  try {
    const token = localStorage.getItem("jwtToken");
    const response = await axios.get(`${BACKEND_URL}/api/collections`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    console.log("Collections response:", JSON.stringify(response.data, null, 2));
    const fetchedCollections = response.data.map((col) => ({
      name: col.category,
      image: `${PINATA_GATEWAY}${col.base_cid}/1.png`,
      nftCount: col.nft_count,
      tokenIdStart: col.token_id_start,
      views: col.views || 0, // Assuming backend might provide this; default to 0
    }));
    setCollections(fetchedCollections);
    saveToCache(fetchedCollections);
    if (fetchedCollections.length === 0) {
      setError("No collections found in the database.");
    }
  } catch (error) {
    console.error("Error fetching collections:", error);
    setError(`Failed to load collections: ${error.response?.data?.message || error.message}`);
  } finally {
    setLoading(false);
  }
};