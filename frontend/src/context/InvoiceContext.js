import { createContext, useReducer } from "react";

export const InvoicesContext = createContext();

export const invoicesReducer = (state, action) => {
  switch (action.type) {
    case "SET_INVOICES":
      return {
        invoices: action.payload,
      };
    case "CREATE_INVOICE":
      return {
        invoices: [action.payload, ...state.invoices],
      };
    case "DELETE_INVOICE":
      return {
        invoices: state.invoices.filter(
          (invoice) => invoice._id !== action.payload._id
        ),
      };
    case "UPDATE_INVOICE":
      return {
        invoices: state.invoices.map((invoice) =>
          invoice._id === action.payload._id ? action.payload : invoice
        ),
      };
    default:
      return state;
  }
};

export const InvoicesContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(invoicesReducer, {
    invoices: [],
  });

  return (
    <InvoicesContext.Provider value={{ ...state, dispatch }}>
      {children}
    </InvoicesContext.Provider>
  );
};
