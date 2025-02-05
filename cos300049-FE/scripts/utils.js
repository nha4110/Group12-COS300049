document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.getAttribute("data-page");

    if (page === "index") {
        loadNFTCollections();
    } else if (page === "market") {
        const params = new URLSearchParams(window.location.search);
        const category = params.get("category") || "All";
        loadMarketNFTs(category);
    }
});

// Function to load NFT collections on index.html
function loadNFTCollections() {
    fetch("data/nfts.json")
        .then(response => response.json())
        .then(data => {
            const nftContainer = document.getElementById("nft-collection");
            nftContainer.innerHTML = ""; // Clear previous content

            if (!data.collections) {
                console.error("Error: 'collections' key is missing in nfts.json");
                return;
            }

            Object.keys(data.collections).forEach(category => {
                const items = data.collections[category]; // FIXED: Correctly accessing collections

                // Skip empty categories
                if (!items || items.length === 0) return;

                // Create collection entry
                const collectionDiv = document.createElement("div");
                collectionDiv.classList.add("nft-collection-item");
                collectionDiv.setAttribute("data-category", category);
                collectionDiv.onclick = () => goToMarket(category);

                const img = document.createElement("img");
                img.src = items[0]?.image || "images/default.jpg"; // Use default image if missing
                img.alt = `${category} Collection`;
                img.style.width = "100px";
                img.style.height = "100px";

                const title = document.createElement("p");
                title.textContent = `${category} Collection (${items.length} items)`;

                const button = document.createElement("button");
                button.textContent = "Go to Market";
                button.onclick = () => goToMarket(category);

                collectionDiv.appendChild(img);
                collectionDiv.appendChild(title);
                collectionDiv.appendChild(button);
                nftContainer.appendChild(collectionDiv);
            });
        })
        .catch(error => console.error("Error loading NFTs:", error));
}



// Function to load NFTs for the market page
function loadMarketNFTs(category) {
    fetch("data/nfts.json")
        .then(response => response.json())
        .then(data => {
            const marketContainer = document.getElementById("market-nft-list");
            marketContainer.innerHTML = ""; // Clear previous items

            if (category === "All") {
                // Load all NFTs from all categories
                for (const key in data) {
                    data[key].forEach(nft => createNFTCard(nft, marketContainer));
                }
            } else if (category in data) {
                // Load only NFTs from the selected category
                data[category].forEach(nft => createNFTCard(nft, marketContainer));
            } else {
                marketContainer.textContent = "No NFTs found for this category.";
            }
        })
        .catch(error => console.error("Error loading market NFTs:", error));
}

// Helper function to create an NFT card
function createNFTCard(nft, container) {
    const nftDiv = document.createElement("div");
    nftDiv.classList.add("nft-item");

    const img = document.createElement("img");
    img.src = nft.image;
    img.alt = nft.title;

    const title = document.createElement("p");
    title.textContent = nft.title;

    const creator = document.createElement("p");
    creator.textContent = `By: ${nft.creator}`;

    const price = document.createElement("p");
    price.textContent = `Price: ${nft.price}`;

    const blockchainAddress = document.createElement("p");
    blockchainAddress.textContent = `Address: ${nft.address}`;

    nftDiv.appendChild(img);
    nftDiv.appendChild(title);
    nftDiv.appendChild(creator);
    nftDiv.appendChild(price);
    nftDiv.appendChild(blockchainAddress);
    container.appendChild(nftDiv);
}

// Function to go to the market page filtered by category
function goToMarket(category) {
    window.location.href = `market.html?category=${category}`;
}
