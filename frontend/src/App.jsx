import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { isAuthenticated } from "./scripts/auth"; // ✅ Uses frontend authentication
import { BalanceProvider } from "./component/AppBar";
import SearchAppBar from "./component/AppBar";
import Footer from "./component/Footer";
import { AuthProvider } from "./scripts/AuthContext"; // ✅ Import AuthProvider

// Lazy loading pages for better performance
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Market = React.lazy(() => import("./pages/Market"));
const Test = React.lazy(() => import("./pages/test"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

/**
 * ✅ Protected Route Component 
 * Ensures only authenticated users can access the route.
 */
const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

/**
 * ✅ Main App Component
 */
function App() {
    return (
        <AuthProvider> {/* ✅ Wrap everything in AuthProvider */}
            <BalanceProvider>
                <Router>
                    <SearchAppBar /> {/* ✅ Navigation Bar */}

                    <Suspense fallback={<div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>}> 
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            
                            {/* ✅ Protected Profile Route */}
                            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                            {/* ✅ Market Route with Dynamic Collection Handling */}
                            <Route path="/market/:category" element={<Market />} />

                            {/* ✅ Test Page */}
                            <Route path="/test" element={<Test />} />

                            {/* ✅ Catch-All for Unknown Routes */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>

                    <Footer /> {/* ✅ Footer on all pages */}
                </Router>
            </BalanceProvider>
        </AuthProvider>
    );
}

export default App;
