import { createContext, useReducer, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        user: action.payload,
        loading: false,
      };
    case "LOGOUT": {
      return { user: null, loading: false };
    }
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      console.log("Raw user from localStorage:", user); // Log what is being returned from localStorage

      if (user) {
        const parsedUser = JSON.parse(user);
        console.log("Parsed user object:", parsedUser); // Log parsed user object
        dispatch({ type: "LOGIN", payload: parsedUser });
      } else {
        dispatch({ type: "LOGOUT" });
      }
    } catch (error) {
      console.error("Error restoring user from localStorage:", error); // Log any errors
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ ...state, dispatch, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
