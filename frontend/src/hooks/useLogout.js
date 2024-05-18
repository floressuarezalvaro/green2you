import { useAuthContext } from "./useAuthContext";
import { useInvoicesContext } from "./useInvoicesContext";
import { useClientsContext } from "./useClientsContext";

export const useLogout = () => {
  const { dispatch } = useAuthContext();
  const { dispatch: invoicesDispatch } = useInvoicesContext();
  const { dispatch: clientsDispatch } = useClientsContext();

  const logout = () => {
    // remove user from storage
    localStorage.removeItem("user");

    // dispatch logout action
    dispatch({ type: "LOGOUT" });
    invoicesDispatch({ type: "SET_INVOICES", payload: null });
    clientsDispatch({ type: "SET_CLIENTS", payload: null });
  };
  return { logout };
};
