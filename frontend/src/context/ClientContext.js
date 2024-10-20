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
        clients: state.clients.filter(
          (client) => client._id !== action.payload._id
        ),
      };
    case "UPDATE_CLIENT":
      return {
        clients: state.clients.map((client) =>
          client._id === action.payload._id ? action.payload : client
        ),
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
    if (user && user.token && user.role === "admin") {
      const fetchClients = async () => {
        const response = await fetch("/api/clients", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          dispatch({ type: "SET_CLIENTS", payload: data });
        }

        if (!response.ok) {
          console.log("clients context no loaded clients");
        }
      };

      fetchClients();
    }
  }, [user]);

  return (
    <ClientsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ClientsContext.Provider>
  );
};
