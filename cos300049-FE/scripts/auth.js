const API_URL = "http://localhost:3000";

// Handle Signup
document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;

    const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
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
        localStorage.setItem("user", username);
        alert("Login successful!");
        window.location.href = "profile.html";
    } else {
        alert(data.message);
    }
});

// Ensure user is logged in before accessing profile.html
if (window.location.pathname.includes("profile.html")) {
    const user = localStorage.getItem("user");
    if (!user) {
        alert("You must be logged in to view this page!");
        window.location.href = "login.html";
    }
}
