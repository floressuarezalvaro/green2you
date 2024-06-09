import { StatementsContext } from "../context/StatementContext";
import { useContext } from "react";

export const useStatementsContext = () => {
  const context = useContext(StatementsContext);

  if (!context) {
    throw Error(
      "useStatementsContext must be used inside an StatementsContextProvider"
    );
  }

  return context;
};
