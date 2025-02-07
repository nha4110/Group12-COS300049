const API_URL = "http://localhost:3000";

// Handle Signup
document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;

    const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, balance: 0 }),
    });

    const data = await response.json();
    
    if (response.ok) {
        alert("Signup successful! Please login.");
        window.location.href = "login.html";
    } else {
        alert(data.message);
    }
});

// Handle Login
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data)); // Save user data including balance
        alert("Login successful!");
        window.location.href = "index.html";
    } else {
        alert(data.message);
    }
});

// Fetch and display user balance
function displayUserBalance() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        document.getElementById("balance-info").innerHTML = `${user.username} has ${user.balance} ETH`;
        document.getElementById("balance-container").style.display = "block";
    }
}

// Handle balance update
document.getElementById("apply-balance")?.addEventListener("click", async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const newBalance = parseFloat(document.getElementById("balance-input").value);

    if (!user || isNaN(newBalance) || newBalance < 0) {
        alert("Invalid balance amount!");
        return;
    }

    user.balance = newBalance;
    localStorage.setItem("user", JSON.stringify(user));

    // Send update to the server
    await fetch(`${API_URL}/update-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, balance: newBalance }),
    });

    alert("Balance updated successfully!");
    displayUserBalance();
});

// Ensure balance is displayed on index.html
if (window.location.pathname.includes("index.html")) {
    displayUserBalance();
}
