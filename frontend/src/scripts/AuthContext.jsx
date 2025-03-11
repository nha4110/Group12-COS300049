import React, { createContext, useReducer, useContext, useEffect, useState } from "react";

const initialState = {
    user: null,
};

const authReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            return {
                ...state,
                user: action.payload,
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
    const [loading, setLoading] = useState(true);

    const logout = () => {
        dispatch({ type: "LOGOUT" });
        localStorage.removeItem("user");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("wallet_address");
    };

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            const devResetFlag = localStorage.getItem('devResetFlag');
            if (!devResetFlag){
                localStorage.clear();
                localStorage.setItem('devResetFlag', 'true');
            }
        }

        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                dispatch({
                    type: "LOGIN",
                    payload: user,
                });
            } catch (error) {
                console.error("AuthContext: Error parsing user data from localStorage:", error);
                localStorage.removeItem("user");
                localStorage.removeItem("jwtToken");
                localStorage.removeItem("wallet_address");
            }
        }
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ state, dispatch, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);