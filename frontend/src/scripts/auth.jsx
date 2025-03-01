{/*
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Lu Nhat Hoang - 105234956
*/}

export const isAuthenticated = () => localStorage.getItem("authenticated") === "true"; // Checks if a user is authenticated by verifying the 'authenticated' flag in localStorage
export const getCurrentUser = () => JSON.parse(localStorage.getItem("currentUser")) || null; // Get current user in localStorage


// Handles user login by checking credentials against stored users
export const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem("users")) || []; // get users in local storage
    const user = users.find(u => u.username === username && u.password === password); // find user in local storage
    if (!user) return { success: false, message: "Invalid username or password" }; // if user not found, return false
    localStorage.setItem("currentUser", JSON.stringify(user)); 
    localStorage.setItem("authenticated", "true");
    return { success: true };
}; // ✅ login logic and set current user for multiple user

// Handles user signup and add new user to localStorage
export const signup = (username, password) => {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some(u => u.username === username)) {
        return { success: false, message: "Username already taken!" };
    }
    const newUser = { username, password, ownedNFTs: [] };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    return { success: true, message: "Signup successful!" };
};

export const buyNFT = (nft) => {
    let user = getCurrentUser();
    if (!user) return { success: false, message: "User not logged in!" };

    // Add NFT to the user's owned collection
    user.ownedNFTs.push(nft);
    updateUser(user);

    // Record the transaction in localStorage
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    transactions.push({
        username: user.username,
        itemBought: nft.title,
        date: new Date().toLocaleString(),
    });
    localStorage.setItem("transactions", JSON.stringify(transactions));

    return { success: true, message: "NFT purchased successfully!" };
}; // ✅ allow user to buy and update user data inculbe transaction history and owned NFTs


export const logout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authenticated");
}; // ✅ logout function

// Updates the user data in localStorage after changes (e.g., buying an NFT)
const updateUser = (updatedUser) => {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users = users.map(u => (u.username === updatedUser.username ? updatedUser : u));
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
};

// This is almost the same as utils but all function here are for the same pupose so i put them here