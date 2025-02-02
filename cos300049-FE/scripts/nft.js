const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", async () => {
    const nftContainer = document.getElementById("nft-container");
    const response = await fetch(`${API_URL}/nfts`);
    const nfts = await response.json();

    nfts.forEach(nft => {
        const nftDiv = document.createElement("div");
        nftDiv.classList.add("nft-card");
        nftDiv.innerHTML = `
            <div class="nft-image">[NFT Placeholder]</div>
            <p>Blockchain Address: ${nft.address || "Not assigned"}</p>
        `;
        nftContainer.appendChild(nftDiv);
    });
});
