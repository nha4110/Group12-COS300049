import React, { createContext, useReducer, useContext, useEffect } from "react";

const initialState = {
    user: JSON.parse(localStorage.getItem("user")) || null, // Load user from localStorage if available
};

const authReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            return {
                ...state,
                user: {
                    ...action.payload,
                    walletAddress: action.payload.wallet_address,
                },
            };
        case "LOGOUT":
            return { ...state, user: null };
        default:
            return state;
    }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const logout = () => {
        dispatch({ type: "LOGOUT" });
        localStorage.removeItem("user"); // Remove user from localStorage on logout
        localStorage.removeItem("jwtToken"); // Optionally remove the token
    };

    useEffect(() => {
        // Check if user data exists in localStorage and set it in the context state
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData) {
            dispatch({ type: "LOGIN", payload: userData });
        }
    }, []); // Runs only once on initial mount

    return (
        <AuthContext.Provider value={{ state, dispatch, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
