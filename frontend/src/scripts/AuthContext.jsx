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
        // Remove all user data from localStorage on logout
        localStorage.removeItem("user_wallet");
        localStorage.removeItem("username");
    };

    useEffect(() => {
        // Load user data from localStorage if available
        const walletAddress = localStorage.getItem("user_wallet");
        const username = localStorage.getItem("username");

        if (walletAddress && username) {
            dispatch({
                type: "LOGIN",
                payload: { wallet_address: walletAddress, username: username },
            });
        }
    }, []);

    return (
        <AuthContext.Provider value={{ state, dispatch, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
