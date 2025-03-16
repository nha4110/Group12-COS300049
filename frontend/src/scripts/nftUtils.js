const CACHE_KEY = "market_nft_cache";

export const checkConnection = async (setAccount) => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  }
};

export const loadNFTsFromCacheOrFetch = (collectionName, setAllNfts, setNfts, setMintedStatus, setTotalNfts, setLoading, fetchCollectionNFTs) => {
  const cachedData = localStorage.getItem(`${CACHE_KEY}_${collectionName}`);
  if (cachedData) {
    const { nfts, mintedStatus, totalNfts, timestamp } = JSON.parse(cachedData);
    const cacheAge = Date.now() - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 1 day
    if (cacheAge < maxAge) {
      setAllNfts(nfts.filter((nft) => !mintedStatus[nft.id]));
      setNfts(nfts.slice(0, 20).filter((nft) => !mintedStatus[nft.id]));
      setMintedStatus(mintedStatus);
      setTotalNfts(totalNfts);
      setLoading(false);
      return;
    }
  }
  fetchCollectionNFTs();
};

export const saveToCache = (collectionName, nftsData, mintedStatusData, totalNftsCount) => {
  const cacheData = {
    nfts: nftsData,
    mintedStatus: mintedStatusData,
    totalNfts: totalNftsCount,
    timestamp: Date.now(),
  };
  localStorage.setItem(`${CACHE_KEY}_${collectionName}`, JSON.stringify(cacheData));
};

export const connectMetaMask = async (setAccount) => {
  if (!window.ethereum) return alert("MetaMask not detected!");
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
  } catch (error) {
    console.error("MetaMask connection error:", error);
    alert("Failed to connect to MetaMask.");
  }
};