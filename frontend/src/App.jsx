import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { WalletProvider } from "./component/AppBar"; 
import SearchAppBar from "./component/AppBar";
import Footer from "./component/Footer";
import { AuthProvider, useAuth } from "./scripts/AuthContext"; 

// Lazy-loaded pages
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Market = React.lazy(() => import("./pages/Market"));
const Test = React.lazy(() => import("./pages/test"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// ✅ Protected Route Component (Uses AuthContext)
const ProtectedRoute = ({ children }) => {
    const { state } = useAuth(); // ✅ Get auth state
    return state.user ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <WalletProvider>
                <Router>
                    <SearchAppBar /> 

                    <Suspense fallback={<div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />

                            {/* ✅ Protected Profile Route */}
                            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                            {/* ✅ Market Route */}
                            <Route path="/market/:category" element={<Market />} />

                            {/* ✅ Test Page */}
                            <Route path="/test" element={<Test />} />

                            {/* ✅ Catch-All */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>

                    <Footer />
                </Router>
            </WalletProvider>
        </AuthProvider>
    );
}

export default App;
