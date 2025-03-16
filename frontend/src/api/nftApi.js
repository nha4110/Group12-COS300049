import axios from "axios";
import { ethers } from "ethers";
import contractData from "../../../backend/build/contracts/MyNFT.json";

const CONTRACT_ADDRESS = "0x84643357E0de364Acc9659021A1920362e1255D5"; // Update if new collection uses a different contract
const ABI = contractData.abi;
const PINATA_GATEWAY = "https://gray-magic-tortoise-619.mypinata.cloud/ipfs/";
const BACKEND_URL = "http://localhost:8081";

export const fetchCollectionNFTs = async (
  collectionName,
  setLoading,
  setError,
  setCreator,
  setTotalNfts,
  setNfts,
  setAllNfts,
  setMintedStatus,
  saveToCache
) => {
  setLoading(true);
  setError(null);
  try {
    const collectionResponse = await axios.get(`${BACKEND_URL}/api/collections/${collectionName}`);
    const { token_id_start, creator, base_cid, nft_count } = collectionResponse.data;
    setCreator(creator);
    setTotalNfts(nft_count);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    const nftsData = [];
    const newMintedStatus = {};

    for (let i = 0; i < nft_count; i++) {
      const tokenId = token_id_start + i;
      try {
        const metadataUrl = `${PINATA_GATEWAY}${base_cid}/${tokenId}.json`;
        const imageUrl = `${PINATA_GATEWAY}${base_cid}/${tokenId}.png`;
        const response = await axios.get(metadataUrl, { timeout: 10000 });
        const isMintedOnChain = await contract.isMinted(tokenId);

        let isOwned = false;
        try {
          const ownershipResponse = await axios.get(`${BACKEND_URL}/check-nft-ownership/${tokenId}`, {
            params: { contractAddress: CONTRACT_ADDRESS, category: collectionName },
          });
          isOwned = ownershipResponse.data.isOwned;
        } catch (ownershipError) {
          console.warn(`Ownership check failed for ${tokenId}:`, ownershipError.message);
        }

        const isMintedOrOwned = isMintedOnChain || isOwned;
        newMintedStatus[tokenId] = isMintedOrOwned;

        if (!isMintedOrOwned) {
          const nftData = {
            id: tokenId,
            name: response.data.name || `NFT ${tokenId}`,
            description: response.data.description || "No description.",
            image: imageUrl,
            metadata: response.data,
            isMinted: false,
          };
          nftsData.push(nftData);
        }
      } catch (error) {
        console.warn(`Failed to fetch NFT ${tokenId}:`, error.message);
        continue;
      }
    }

    setNfts(nftsData.slice(0, 20));
    setAllNfts(nftsData);
    setMintedStatus(newMintedStatus);
    saveToCache(nftsData, newMintedStatus, nft_count);
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    setError("Failed to load NFTs for this collection.");
  } finally {
    setLoading(false);
  }
};

export const mintNFT = async (
  tokenId,
  account,
  creator,
  collectionName,
  navigate,
  setMintedStatus,
  setNfts,
  setAllNfts,
  saveToCache
) => {
  if (!account) return alert("Connect MetaMask first.");
  if (account.toLowerCase() === creator?.toLowerCase()) {
    return alert("Creators cannot buy their own NFTs.");
  }

  const token = localStorage.getItem("jwtToken");
  if (!token) {
    alert("Please log in to mint NFTs.");
    navigate("/login");
    return;
  }

  try {
    const ownershipResponse = await axios.get(`${BACKEND_URL}/check-nft-ownership/${tokenId}`, {
      params: { contractAddress: CONTRACT_ADDRESS, category: collectionName },
    });
    if (ownershipResponse.data.isOwned) {
      alert("This NFT is already owned in this collection.");
      return;
    }

    const collectionResponse = await axios.get(`${BACKEND_URL}/api/collections/${collectionName}`);
    const { base_cid } = collectionResponse.data;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    const metadataURI = `${PINATA_GATEWAY}${base_cid}/${tokenId}.json`;
    const balance = await provider.getBalance(account);
    if (balance < ethers.parseEther("0.06")) {
      alert("Insufficient ETH balance. Need at least 0.06 ETH for minting and gas.");
      return;
    }

    const isMinted = await contract.isMinted(tokenId);
    if (isMinted) {
      alert(`Token ${tokenId} is already minted on-chain.`);
      return;
    }

    const isUriOwned = await contract.isContentOwned(metadataURI);
    if (isUriOwned) {
      alert(`Metadata URI ${metadataURI} is already used.`);
      return;
    }

    const gasEstimate = await contract.payToMint.estimateGas(account, metadataURI, tokenId, {
      value: ethers.parseEther("0.05"),
    });
    const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);

    const tx = await contract.payToMint(account, metadataURI, tokenId, {
      value: ethers.parseEther("0.05"),
      gasLimit: gasLimit,
    });

    alert("Transaction submitted. Waiting for confirmation...");
    const receipt = await tx.wait();

    const gasUsed = receipt.gasUsed || BigInt(0);
    const effectiveGasPrice = receipt.effectiveGasPrice || BigInt(0);
    const totalGasFeeWei = gasUsed * effectiveGasPrice;
    const totalGasFeeEth = ethers.formatEther(totalGasFeeWei);

    const txDetails = {
      txHash: receipt.hash,
      from: receipt.from,
      to: CONTRACT_ADDRESS,
      amount: "-0.05 ETH",
      gasUsed: gasUsed.toString(),
      totalGasFee: totalGasFeeEth,
    };

    const metadataUrl = `${PINATA_GATEWAY}${base_cid}/${tokenId}.json`;
    const metadataResponse = await axios.get(metadataUrl);
    const nftName = metadataResponse.data.name || `NFT ${tokenId}`;
    const imageUrl = `${PINATA_GATEWAY}${base_cid}/${tokenId}.png`;

    const payload = {
      walletAddress: account,
      nftId: tokenId,
      nftName,
      price: "0.05",
      tokenID: tokenId,
      contractAddress: CONTRACT_ADDRESS,
      imageUrl,
      category: collectionName,
      txHash: txDetails.txHash,
      creator: creator || null,
    };

    const buyResponse = await axios.post(`${BACKEND_URL}/buy-nft`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch((error) => {
      if (error.response?.status === 401) {
        alert("Session expired or invalid token. Please log in again.");
        localStorage.removeItem("jwtToken");
        navigate("/login");
        throw new Error("Unauthorized");
      }
      throw error;
    });

    if (!buyResponse.data.success) {
      throw new Error(`Failed to record NFT purchase: ${buyResponse.data.message}`);
    }

    if (creator) {
      await signer.sendTransaction({
        to: creator,
        value: ethers.parseEther("0.05"),
      });
    }

    setMintedStatus((prev) => ({ ...prev, [tokenId]: true }));
    setNfts((prev) => prev.filter((nft) => nft.id !== tokenId));
    setAllNfts((prev) => prev.filter((nft) => nft.id !== tokenId));
    const cachedData = JSON.parse(localStorage.getItem(`market_nft_cache_${collectionName}`));
    if (cachedData) {
      cachedData.nfts = cachedData.nfts.filter((nft) => nft.id !== tokenId);
      cachedData.mintedStatus[tokenId] = true;
      saveToCache(cachedData.nfts, cachedData.mintedStatus, cachedData.totalNfts);
    }

    alert("NFT minted and recorded successfully!");
    window.dispatchEvent(new Event("balanceUpdated"));
    return true;
  } catch (error) {
    console.error("Minting error:", error);
    if (error.code === "CALL_EXCEPTION") {
      alert("Minting failed: Transaction reverted. Check token ID, URI, or funds.");
    } else {
      alert(`Minting failed: ${error.message || "Unknown error"}`);
    }
    return false;
  }
};