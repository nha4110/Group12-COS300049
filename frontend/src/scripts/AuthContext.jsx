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
        localStorage.removeItem("user_wallet"); // Remove stored user data
    };

    useEffect(() => {
        const walletAddress = localStorage.getItem("user_wallet");
        const username = localStorage.getItem("username");

        if (walletAddress && username) {
            dispatch({
                type: "LOGIN",
                payload: { walletAddress, username },
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
