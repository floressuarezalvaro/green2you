import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useAuthContext } from "../hooks/useAuthContext";
import { useInvoicesContext } from "../hooks/useInvoicesContext";
import { useClientsContext } from "../hooks/useClientsContext";

import ClientDetails from "../components/Profile/ProfileClientDetails";
import InvoiceDetails from "../components/InvoiceDetails";
import Statements from "../components/Profile/StatementAccordian.js";
import AccountSummary from "../components/Profile/AccountSummary.js";
import ProfilePayments from "../components/Profile/ProfilePayments.js";
import Pagination from "../components/Pagination.js";

const Profile = () => {
  const { user, logout } = useAuthContext();
  const { clientId } = useParams();
  const { invoices, dispatch } = useInvoicesContext();
  const { clients } = useClientsContext();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user || !clientId) return;

      try {
        const response = await fetch(`/clients/profile/${clientId}`, {
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
  }, [dispatch, user, logout, clientId]);

  if (!invoices) {
    return <div>Loading...</div>;
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = invoices.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const selectedClient =
    clients?.find((client) => client._id === clientId) || null;

  return (
    <div className="profile">
      <h3>Profile Page</h3>
      {selectedClient && (
        <>
          <ClientDetails client={selectedClient} />
          <AccountSummary client={selectedClient._id} />
          <Statements client={selectedClient._id} />
        </>
      )}

      {selectedClient ? (
        <>
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
          <ProfilePayments />
        </>
      ) : (
        <p>Client not found.</p>
      )}
    </div>
  );
};

export default Profile;
