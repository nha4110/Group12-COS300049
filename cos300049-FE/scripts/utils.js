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
            nftContainer.innerHTML = ""; // Clear existing content

            for (const category in data) {
                const items = data[category];

                // Create a collection entry for each category
                const collectionDiv = document.createElement("div");
                collectionDiv.classList.add("nft-collection-item");
                collectionDiv.setAttribute("data-category", category);

                const img = document.createElement("img");
                img.src = items[0].image; // Use the first NFT image as collection preview
                img.alt = `${category} Collection`;

                const title = document.createElement("p");
                title.textContent = `${category} Collection (${items.length} items)`;

                const button = document.createElement("button");
                button.textContent = "Go to Market";
                button.onclick = () => goToMarket(category);

                collectionDiv.appendChild(img);
                collectionDiv.appendChild(title);
                collectionDiv.appendChild(button);
                nftContainer.appendChild(collectionDiv);
            }
        })
        .catch(error => console.error("Error loading NFTs:", error));
}

// Function to load NFTs for the market page
function loadMarketNFTs(category) {
    fetch("data/nfts.json")
        .then(response => response.json())
        .then(data => {
            const marketContainer = document.getElementById("market-nft-list");
            marketContainer.innerHTML = "";

            if (category in data) {
                data[category].forEach(nft => {
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

                    nftDiv.appendChild(img);
                    nftDiv.appendChild(title);
                    nftDiv.appendChild(creator);
                    nftDiv.appendChild(price);
                    marketContainer.appendChild(nftDiv);
                });
            } else {
                marketContainer.textContent = "No NFTs found for this category.";
            }
        })
        .catch(error => console.error("Error loading market NFTs:", error));
}

// Function to go to the market page filtered by category
function goToMarket(category) {
    window.location.href = `market.html?category=${category}`;
}
