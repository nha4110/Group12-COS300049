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
                const items = data.collections[category];

                // Skip empty categories
                if (!items || items.length === 0) return;

                // Create collection entry
                const collectionDiv = document.createElement("div");
                collectionDiv.classList.add("nft-collection-item");
                collectionDiv.setAttribute("data-category", category);
                collectionDiv.onclick = () => goToMarket(category);

                const img = document.createElement("img");
                img.src = items[0]?.image || "images/default.jpg";
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
            const detailsContainer = document.getElementById("nft-details");
            
            // Ensure market section is visible
            marketContainer.style.display = "grid";
            detailsContainer.style.display = "none";
            
            marketContainer.innerHTML = ""; // Clear previous items

            if (!data.collections) {
                console.error("Error: 'collections' key is missing in nfts.json");
                marketContainer.textContent = "Error loading NFTs.";
                return;
            }

            if (category === "All") {
                Object.values(data.collections).forEach(categoryItems => {
                    categoryItems.forEach(nft => createNFTCard(nft, marketContainer));
                });
            } else if (data.collections[category]) {
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

// Function to display NFT details in full-page view with Buy button
function showNFTDetails(nft) {
    const marketContainer = document.getElementById("market-nft-list");
    const detailsContainer = document.getElementById("nft-details");

    // Hide market section and show only the details view
    marketContainer.style.display = "none";
    detailsContainer.style.display = "block";

    detailsContainer.innerHTML = `
        <div class="nft-fullview">
            <img src="${nft.image}" alt="${nft.title}" class="nft-full-image">
            <div class="nft-full-info">
                <h2>${nft.title}</h2>
                <p><strong>Creator:</strong> ${nft.creator}</p>
                <p><strong>Price:</strong> ${nft.price}</p>
                <p><strong>Blockchain Address:</strong> ${nft.blockchainAddress}</p>
                <button id="buy-button">Buy</button>
                <button id="back-to-market">Back</button>
            </div>
        </div>
    `;

    // Handle back button
    document.getElementById("back-to-market").addEventListener("click", () => {
        marketContainer.style.display = "grid";
        detailsContainer.style.display = "none";
    });

    // Handle buy button (does nothing for now)
    document.getElementById("buy-button").addEventListener("click", () => {
        alert("Buy functionality not implemented yet.");
    });
}

// Function to go to the market page filtered by category
function goToMarket(category) {
    window.location.href = `market.html?category=${category}`;
}
