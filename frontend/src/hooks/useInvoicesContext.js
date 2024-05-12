import { InvoicesContext } from "../context/InvoiceContext";
import { useContext } from "react";

export const useInvoicesContext = () => {
  const context = useContext(InvoicesContext);

  if (!context) {
    throw Error(
      "useInvoicesContext must be used inside an InvoicesContextProvider"
    );
  }

  return context;
};
