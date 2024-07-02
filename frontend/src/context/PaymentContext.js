import { createContext, useReducer } from "react";

export const PaymentsContext = createContext();

export const paymentsReducer = (state, action) => {
  switch (action.type) {
    case "SET_PAYMENTS":
      return {
        payments: action.payload,
      };
    case "CREATE_PAYMENT":
      return {
        payments: [action.payload, ...state.payments],
      };
    case "DELETE_PAYMENT":
      return {
        payments: state.payments.filter(
          (payment) => payment._id !== action.payload._id
        ),
      };
    case "UPDATE_PAYMENT":
      return {
        payments: state.payments.map((payment) =>
          payment._id === action.payload._id ? action.payload : payment
        ),
      };
    default:
      return state;
  }
};

export const PaymentsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(paymentsReducer, {
    payments: [],
  });

  return (
    <PaymentsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </PaymentsContext.Provider>
  );
};
