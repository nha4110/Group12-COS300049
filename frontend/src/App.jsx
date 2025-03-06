import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { WalletProvider } from "./scripts/WalletContext";
import { AuthProvider, useAuth } from "./scripts/AuthContext";
import { BalanceProvider } from "./scripts/BalanceContext";
import SearchAppBar from "./component/AppBar";
import Footer from "./component/Footer";

// Lazy-loaded pages
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Market = React.lazy(() => import("./pages/Market"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { state } = useAuth();
    return state.user ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <WalletProvider>
                <BalanceProvider>
                    <Router>
                        <SearchAppBar /> {/* Navbar visible on all pages */}

                        <Suspense fallback={<div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>}>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                <Route path="/market/:category" element={<Market />} />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Suspense>

                        <Footer />
                    </Router>
                </BalanceProvider>
            </WalletProvider>
        </AuthProvider>
    );
}

export default App;
