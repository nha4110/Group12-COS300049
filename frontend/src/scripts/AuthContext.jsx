import React, { createContext, useReducer, useContext, useEffect } from "react";

const initialState = {
    user: null,
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
    };

    useEffect(() => {
        // Check if user data exists in localStorage and set it in the context state
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData) {
            dispatch({ type: "LOGIN", payload: userData });
        }
    }, []);

    return (
        <AuthContext.Provider value={{ state, dispatch, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
