import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { useAuth } from "../scripts/AuthContext"; // ✅ Import useAuth

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { dispatch } = useAuth(); // ✅ Access Auth Context

  // Handle Input Changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await login(form.username, form.password); // Call login API

    if (response.success) {
      setMessage("✅ Login successful!");
      dispatch({ type: "LOGIN", payload: response.user }); // ✅ Update auth state
      navigate("/profile"); // Redirect on success
    } else {
      setMessage(`❌ ${response.message}`); // Show error message
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="button" onClick={() => navigate("/signup")}>Go to Signup</button> {/* New button */}
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default Login;
