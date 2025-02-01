document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");

    if (signupForm) {
        signupForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const username = document.getElementById("new-username").value.trim();
            const password = document.getElementById("new-password").value.trim();

            if (!username || !password) {
                alert("Username and password cannot be empty!");
                return;
            }

            let users = JSON.parse(localStorage.getItem("users")) || [];

            if (users.some(user => user.username === username)) {
                alert("Username already exists!");
                return;
            }

            users.push({ username, password });
            localStorage.setItem("users", JSON.stringify(users));
            alert("Signup successful! You can now log in.");
            window.location.href = "login.html";
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            let users = JSON.parse(localStorage.getItem("users")) || [];
            const user = users.find(user => user.username === username && user.password === password);

            if (user) {
                alert("Login successful!");
                localStorage.setItem("loggedInUser", username);
                window.location.href = "profile.html";
            } else {
                alert("Invalid username or password!");
            }
        });
    }
});
