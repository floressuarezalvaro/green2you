import { useEffect, useState } from "react";

import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { format } from "date-fns";

import { useAuthContext } from "../../hooks/useAuthContext";
import { usePaymentsContext } from "../../hooks/usePaymentsContext";

import UpdatePaymentModal from "../modals/UpdatePaymentModal";
import DeletePaymentModal from "../modals/WarningDeletePayment";
import Pagination from "../Pagination";

const ProfilePayments = ({ client, user }) => {
  const { logout } = useAuthContext();
  const { payments, dispatch } = usePaymentsContext();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user || !client) return;

      try {
        const response = await fetch(`/payments/client/${client}`, {
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

        const data = await response.json();
        dispatch({ type: "SET_PAYMENTS", payload: data });
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      }
    };

    fetchPayments();
  }, [dispatch, user, client, logout]);

  if (!payments) {
    return <div>Loading...</div>;
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = payments.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <h5 className="payments-header">Payments</h5>
      {payments.length > 0 ? (
        <>
          {currentItems.map((payment) => (
            <div className="details" key={payment._id}>
              <p>
                <strong>Check Date: </strong>
                {format(new Date(payment.checkDate), "MM/dd/yyyy")}
              </p>
              <p>
                <strong>Amount: </strong>
                {payment.amount}
              </p>
              <p>
                <strong>Check Number: </strong>
                {payment.checkNumber}
              </p>
              <p>
                <strong>Memo: </strong>
                {payment.memo}
              </p>
              <p>
                Created:{" "}
                {formatDistanceToNow(new Date(payment.createdAt), {
                  addSuffix: true,
                })}
              </p>
              <p>
                Updated:{" "}
                {formatDistanceToNow(new Date(payment.updatedAt), {
                  addSuffix: true,
                })}
              </p>
              {user && user.role === "admin" && (
                <>
                  <DeletePaymentModal
                    key={`delete-${payment._id}`}
                    payment={payment}
                  />
                  <UpdatePaymentModal
                    key={`update-${payment._id}`}
                    payment={payment}
                  />
                </>
              )}
            </div>
          ))}
          {payments.length > itemsPerPage && (
            <Pagination
              itemsPerPage={itemsPerPage}
              totalItems={payments.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          )}
        </>
      ) : (
        <p className="profile-no-payments">You have no payments yet.</p>
      )}
    </div>
  );
};

export default ProfilePayments;
