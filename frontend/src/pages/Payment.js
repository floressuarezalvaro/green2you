import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { usePaymentsContext } from "../hooks/usePaymentsContext.js";
import { useClientsContext } from "../hooks/useClientsContext.js";

import PaymentDetails from "../components/PaymentDetails";
import Pagination from "../components/Pagination.js";
import ClientSearch from "../components/forms/ClientSearch";

const Payment = () => {
  const { user, logout } = useAuthContext();
  const { payments, dispatch } = usePaymentsContext();
  const { clients } = useClientsContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;

  useEffect(() => {
    if (!user) {
      logout();
    }

    const fetchPayments = async () => {
      try {
        const response = await fetch("/api/payments", {
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
        dispatch({ type: "SET_PAYMENTS", payload: json });
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      }
    };

    fetchPayments();
  }, [user, dispatch, logout]);

  if (!payments || !clients) {
    return <div>Loading...</div>;
  }

  // Filter payments by client name
  const filteredPayments = payments.filter((payment) => {
    const client = clients.find((client) => client._id === payment.clientId);
    return (
      !searchTerm || // Show all if no search term
      (client?.clientName &&
        client.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-separation">
      <div className="clients">
        <h3>Payments Page</h3>
        <ClientSearch setClientName={setSearchTerm} />
        {filteredPayments.length > 0 ? (
          currentItems.map((payment) => {
            const client = clients.find(
              (client) => client._id === payment.clientId
            );
            return (
              <PaymentDetails
                key={payment._id}
                payment={payment}
                client={client}
              />
            );
          })
        ) : (
          <p className="no-statements">No Payments Yet</p>
        )}
        {filteredPayments.length > itemsPerPage && (
          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={filteredPayments.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        )}
      </div>
    </div>
  );
};

export default Payment;
