import { useEffect } from "react";

import { useAuthContext } from "../../hooks/useAuthContext";
import { useBalancesContext } from "../../hooks/useBalancesContext";

import UpdateBalanceModal from "../modals/UpdateBalanceModal";

const AccountSummary = ({ client }) => {
  const { user, logout } = useAuthContext();
  const { balances, dispatch } = useBalancesContext();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) {
        logout();
      }

      try {
        const response = await fetch("/api/balances/client/" + client, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            logout();
          }
          return;
        }

        const json = await response.json();
        dispatch({ type: "SET_BALANCE", payload: json });
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      }
    };

    fetchBalance();
  }, [user, client, dispatch, logout]);

  if (!balances) {
    return <div>Loading...</div>;
  }

  return (
    <div className="account-summary">
      <h4>Account Summary</h4>
      <p>
        <strong>Previous Statement Balance: </strong>$
        {balances.previousStatementBalance}
      </p>
      <p>
        <strong>Payments and Credits: </strong>${balances.paymentsOrCredits}
      </p>
      <p>
        <strong>Service Dues: </strong>${balances.serviceDues}
      </p>
      <p>
        <strong>New Statement Balance: </strong>${balances.newStatementBalance}
      </p>
      {user && user.role === "admin" && (
        <>
          <UpdateBalanceModal key={balances._id} balances={balances} />
        </>
      )}
    </div>
  );
};

export default AccountSummary;
