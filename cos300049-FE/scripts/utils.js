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

            if (!data.collections) {
                console.error("Error: 'collections' key is missing in nfts.json");
                marketContainer.textContent = "Error loading NFTs.";
                return;
            }

            if (category === "All") {
                // Load all NFTs from all categories
                Object.values(data.collections).forEach(categoryItems => {
                    categoryItems.forEach(nft => createNFTCard(nft, marketContainer));
                });
            } else if (data.collections[category]) {
                // Load only NFTs from the selected category
                data.collections[category].forEach(nft => createNFTCard(nft, marketContainer));
            } else {
                marketContainer.textContent = "No NFTs found for this category.";
            }
        })
        .catch(error => console.error("Error loading market NFTs:", error));
}


// Function to create an NFT card and add click event to show details
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

    // Append elements to NFT card
    nftDiv.appendChild(img);
    nftDiv.appendChild(title);
    nftDiv.appendChild(creator);
    nftDiv.appendChild(price);

    // Add event listener to show NFT details when clicked
    nftDiv.addEventListener("click", () => showNFTDetails(nft));

    container.appendChild(nftDiv);
}



// Function to display NFT details
function showNFTDetails(nft) {
    const detailsSection = document.getElementById("nft-details");
    const detailsContainer = document.getElementById("nft-info");

    // Populate the details section with the blockchain address
    detailsContainer.innerHTML = `
        <img src="${nft.image}" alt="${nft.title}" style="width:200px; height:auto;">
        <h3>${nft.title}</h3>
        <p><strong>Creator:</strong> ${nft.creator}</p>
        <p><strong>Price:</strong> ${nft.price}</p>
        <p><strong>Address:</strong> ${nft.blockchainAddress}</p> <!-- Blockchain address is displayed here -->
    `;

    // Show the details section
    detailsSection.style.display = "block";
}


// Function to close NFT details
function closeNFTDetails() {
    document.getElementById("nft-details").style.display = "none";
}


// Function to go to the market page filtered by category
function goToMarket(category) {
    window.location.href = `market.html?category=${category}`;
}
