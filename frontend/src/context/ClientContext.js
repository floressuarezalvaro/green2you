import { createContext, useReducer, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
export const ClientsContext = createContext();

export const clientsReducer = (state, action) => {
  switch (action.type) {
    case "SET_CLIENTS":
      return {
        clients: action.payload,
      };
    case "CREATE_CLIENT":
      return {
        clients: [action.payload, ...state.clients],
      };
    case "DELETE_CLIENT":
      return {
        clients: state.clients.filter((c) => c._id !== action.payload._id),
      };
    default:
      return state;
  }
};

export const ClientsContextProvider = ({ children }) => {
  const { user } = useAuthContext();

  const [state, dispatch] = useReducer(clientsReducer, {
    clients: [],
  });
  useEffect(() => {
    // Example function to fetch clients
    const fetchClients = async () => {
      const response = await fetch("/clients", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        dispatch({ type: "SET_CLIENTS", payload: data });
      }
    };

    fetchClients();
  }, [user.token]);

  return (
    <ClientsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ClientsContext.Provider>
  );
};
