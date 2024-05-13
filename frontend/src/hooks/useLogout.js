import { useAuthContext } from "./useAuthContext";
import { useInvoicesContext } from "./useInvoicesContext";
import { dispatch } from "react";

export const useLogout = () => {
  const { dispatch } = useAuthContext();
  const { dispatch: invoicesDispatch } = useInvoicesContext();

  const logout = () => {
    // remove user from storage
    localStorage.removeItem("user");

    // dispatch logout action
    dispatch({ type: "LOGOUT" });
    invoicesDispatch({ type: "SET_INVOICES", payload: null });
  };
  return { logout };
};
