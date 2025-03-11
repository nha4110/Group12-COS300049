{/*
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Lu Nhat Hoang -  105234956
*/ }
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import SearchAppBar from "../component/AppBar"; // bar and some style mui
import { login } from "../scripts/auth.jsx"; // auth handle sign up and login logic 

// use local storage to store user info like username and password for other use
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Remove default margin and padding from body
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, []);

  // handle login logic
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent form default submission
    const result = login(username, password);

    if (result.success) {
      navigate("/profile"); // Redirect to profile on successful login
    } else {
      alert(result.message); // Show error message if login fails
    }
  };

  return (
    <>
      <div className="login-container" style={styles.container}>
        <h2>Login</h2>
        <form id="login-form" onSubmit={handleSubmit} style={styles.form}>
          {/* Username Input */}
          <label htmlFor="username" style={styles.label}>Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />

          {/* Password Input */}
          <label htmlFor="password" style={styles.label}>Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          {/* Sign Up and Login Buttons */}
          <button type="button" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
          <button type="submit" style={styles.button}>Login</button>
        </form>
      </div>
    </>
  );
}

// css for login page
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "70vh",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "300px",
    gap: "10px",
  },
  label: {
    fontSize: "16px",
    fontWeight: "bold",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    width: "100%",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  }
};
