import { useEffect, useState } from "react";

import { useAuthContext } from "../../hooks/useAuthContext";
import { useInvoicesContext } from "../../hooks/useInvoicesContext";

import InvoiceDetails from "../../components/InvoiceDetails";
import Pagination from "../Pagination";

const ProfileInvoices = ({ client }) => {
  const { user, logout } = useAuthContext();
  const { invoices, dispatch } = useInvoicesContext();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user || !client) return;

      try {
        const response = await fetch(`/clients/profile/${client}`, {
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
        dispatch({ type: "SET_INVOICES", payload: data });
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      }
    };

    fetchInvoices();
  }, [dispatch, user, logout, client]);

  if (!invoices) {
    return <div>Loading...</div>;
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = invoices.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="profile-invoices">
      <h5>Invoices</h5>
      {invoices?.length > 0 ? (
        <>
          {currentItems.map((invoice) => (
            <InvoiceDetails
              key={invoice._id}
              invoice={invoice}
              hideClientName={true}
            />
          ))}
          {invoices.length > itemsPerPage && (
            <Pagination
              itemsPerPage={itemsPerPage}
              totalItems={invoices.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          )}
        </>
      ) : (
        <p className="profile-no-invoices">You have no invoices yet.</p>
      )}
    </div>
  );
};

export default ProfileInvoices;
