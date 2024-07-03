import { createContext, useReducer } from "react";

export const BalancesContext = createContext();

export const balancesReducer = (state, action) => {
  switch (action.type) {
    case "SET_BALANCE":
      return {
        balances: action.payload,
      };
    case "CREATE_BALANCE":
      return {
        balances: [action.payload, ...state.balances],
      };
    case "DELETE_BALANCE":
      return {
        balances: state.balances.filter(
          (balance) => balance._id !== action.payload._id
        ),
      };
    case "UPDATE_BALANCE":
      return {
        balances: state.balances.map((balance) =>
          balance._id === action.payload._id ? action.payload : balance
        ),
      };
    default:
      return state;
  }
};

export const BalancesContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(balancesReducer, {
    balances: [],
  });

  return (
    <BalancesContext.Provider value={{ ...state, dispatch }}>
      {children}
    </BalancesContext.Provider>
  );
};
