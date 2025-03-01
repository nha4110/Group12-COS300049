{/*
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Lu Nhat Hoang -  105234956
*/}
import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { isAuthenticated } from "./scripts/auth.jsx"; // Import isAuthenticated function for the login status
import { BalanceProvider } from "./component/AppBar"; // Balance context provider for all pages
import SearchAppBar from "./component/AppBar"; // Menu bar
import Footer from "./component/Footer"; 

// Lazy loading for better performance
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Market = React.lazy(() => import("./pages/Market.jsx"));
const Test = React.lazy(() => import("./pages/test")); // ✅ Added Test page
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Protected Route Component
const ProtectedRoute = ({ children }) => { 
    return isAuthenticated() ? children : <Navigate to="/login" replace />; // Redirect if not authenticated
};

// Ensure authentication state is updated dynamically
function App() {
    const [auth, setAuth] = useState(isAuthenticated()); 

    useEffect(() => {
        const handleAuthChange = () => setAuth(isAuthenticated());
        window.addEventListener("authChange", handleAuthChange);
        return () => window.removeEventListener("authChange", handleAuthChange);
    }, []);

    return (
        <BalanceProvider> 
            <Router>
                <SearchAppBar /> {/* Menu bar on all pages */}
                <Suspense fallback={<div>Loading...</div>}> {/* Lazy loading fallback */}
                    <Routes>
                        <Route path="/" element={<Home />} /> {/* Default page */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/market/:collectionName" element={<Market />} /> 
                        <Route path="/test" element={<Test />} /> {/* ✅ Added test route */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
                <Footer /> {/* Footer on all pages */}
            </Router>
        </BalanceProvider>
    );
}

export default App;
