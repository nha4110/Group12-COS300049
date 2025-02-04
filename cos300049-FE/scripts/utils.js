// Filter function
function filterCollection(category) {
    console.log('Filter by category:', category);
    // Logic for filtering NFTs based on category goes here
    // Example: Hide/show NFT items based on category
    const nftItems = document.querySelectorAll('.nft-item');
    nftItems.forEach(item => {
        if (category === 'All' || item.classList.contains(category)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Function to go to the market
function goToMarket() {
    window.location.href = '/market.html'; // Replace with actual market page URL
}
