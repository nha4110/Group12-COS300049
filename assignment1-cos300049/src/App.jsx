{/*
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Lu Nhat Hoang -  105234956
*/ }
import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { isAuthenticated } from "./scripts/auth.jsx"; // Import isAuthenticated function for the login status
import { BalanceProvider } from "./component/AppBar"; // Balance context provider for all pages
import SearchAppBar from "./component/AppBar"; // menu bar which in this call SearchAppBar 
import Footer from "./component/Footer"; 

// for what i read lazy loading is a good way to load the page faster
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Market = React.lazy(() => import("./pages/Market.jsx"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Protected Route Component
const ProtectedRoute = ({ children }) => { 
    return isAuthenticated() ? children : <Navigate to="/login" replace />; // Redirect to login if not authenticated when cilcking on profile icon
};
// function making sure everything work as plan
function App() {
    const [auth, setAuth] = useState(isAuthenticated()); 

    useEffect(() => {
        const handleAuthChange = () => setAuth(isAuthenticated());
        window.addEventListener("authChange", handleAuthChange);
        return () => window.removeEventListener("authChange", handleAuthChange);
    }, []);
    // ✅ update auth state when authChange event is triggered
    return (
        // Balance context provider for all pages
        <BalanceProvider> 
            <Router>
                <SearchAppBar /> {/* Menu bar will be shown on all pages */}
                <Suspense fallback={<div>Loading...</div>}> {/* Suspense for lazy loading */}
                    <Routes>
                        <Route path="/" element={<Home />} /> {/* defaut will be Home */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> {/* Using the useEffect above */}
                        <Route path="/market/:collectionName" element={<Market />} /> 
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
                <Footer /> {/* Footer will be shown on all pages */}
            </Router>
        </BalanceProvider>
    );
}

export default App;
