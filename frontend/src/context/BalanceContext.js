import { createContext, useReducer } from "react";

export const BalancesContext = createContext();

export const balancesReducer = (state, action) => {
  switch (action.type) {
    case "SET_BALANCE":
      return {
        balances: action.payload,
      };
    default:
      return state;
  }
};

export const BalancesContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(balancesReducer, {
    balances: {},
  });

  return (
    <BalancesContext.Provider value={{ ...state, dispatch }}>
      {children}
    </BalancesContext.Provider>
  );
};
