import React, { createContext, useReducer, useContext } from "react";

// Initial state
const initialState = {
    user: null,
};

// Reducer function to manage auth state
const authReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            return { 
                ...state, 
                user: { 
                    ...action.payload, 
                    walletAddress: action.payload.wallet_address // ✅ Ensure wallet is stored
                } 
            };
        case "LOGOUT":
            return { ...state, user: null };
        default:
            return state;
    }
};


// Create Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};

// ✅ Custom Hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
