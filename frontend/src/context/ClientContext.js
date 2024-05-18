import { createContext, useReducer } from "react";

export const ClientsContext = createContext();

export const clientsReducer = (state, action) => {
  switch (action.type) {
    case "SET_CLIENTS":
      return {
        clients: action.payload,
      };
    default:
      return state;
  }
};

export const ClientsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(clientsReducer, {
    clients: null,
  });

  return (
    <ClientsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ClientsContext.Provider>
  );
};
