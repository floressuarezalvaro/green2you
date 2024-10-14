import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { usePaymentsContext } from "../hooks/usePaymentsContext.js";

import PaymentDetails from "../components/PaymentDetails";
import Pagination from "../components/Pagination.js";
// import ClientSearch from "../components/forms/ClientSearch";

const Payment = () => {
  const { user, logout } = useAuthContext();
  const { payments, dispatch } = usePaymentsContext();

  const [currentPage, setCurrentPage] = useState(1);
  //   const [searchTerm, setSearchTerm] = useState("");
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

  if (!payments) {
    return <div>Loading...</div>;
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = payments.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-separation">
      <div className="clients">
        <h3>Payments Page</h3>
        {/* <ClientSearch setClientName={setSearchTerm} /> */}
        {currentItems &&
          currentItems.map((payment) => (
            <PaymentDetails key={payment._id} payment={payment} />
          ))}
        {payments.length > itemsPerPage && (
          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={payments.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        )}
      </div>
    </div>
  );
};

export default Payment;
