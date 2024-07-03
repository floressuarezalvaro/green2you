import { BalancesContext } from "../context/BalanceContext";
import { useContext } from "react";

export const useBalancesContext = () => {
  const context = useContext(BalancesContext);

  if (!context) {
    throw Error(
      "useBalancesContext must be used inside an BalancesContextProvider"
    );
  }

  return context;
};
