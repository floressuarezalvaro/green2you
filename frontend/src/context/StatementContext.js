import { createContext, useReducer } from "react";

export const StatementsContext = createContext();

export const statementsReducer = (state, action) => {
  switch (action.type) {
    case "SET_STATEMENTS":
      return {
        statements: action.payload,
      };
    case "CREATE_STATEMENT":
      return {
        statements: [action.payload, ...state.statements],
      };
    case "UPDATE_STATEMENT":
      return {
        statements: state.statements.filter(
          (statement) => statement._id !== action.payload._id
        ),
      };
    default:
      return state;
  }
};

export const StatementsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(statementsReducer, {
    statements: null,
  });

  return (
    <StatementsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </StatementsContext.Provider>
  );
};
