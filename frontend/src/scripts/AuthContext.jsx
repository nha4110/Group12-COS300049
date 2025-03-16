{/*
Lu Nhat Hoang -  105234956
Nguyen Ngoc Huy Hoang - 105514373
Chung Dung Toan - 105514412
Le Anh Tuan - 105011586
*/ }
import React, { createContext, useReducer, useContext, useEffect, useState } from "react";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem("user", JSON.stringify(action.payload));
      return { ...state, user: action.payload };
    case "LOGOUT":
      localStorage.removeItem("user");
      localStorage.removeItem("jwtToken"); // Updated to match
      localStorage.removeItem("wallet_address"); // Updated to match
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
  };

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const devResetFlag = localStorage.getItem("devResetFlag");
      if (!devResetFlag) {
        localStorage.clear();
        localStorage.setItem("devResetFlag", "true");
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);