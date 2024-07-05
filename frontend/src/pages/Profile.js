import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useAuthContext } from "../hooks/useAuthContext";
import { useInvoicesContext } from "../hooks/useInvoicesContext";
import { useClientsContext } from "../hooks/useClientsContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import UpdateClientModal from "../components/modals/UpdateClientModal";
import InvoiceDetails from "../components/InvoiceDetails";
import DeleteClientModal from "../components/modals/WarningDeleteClient.js";
import Statements from "../components/StatementAccordian.js";
import AccountSummary from "../components/AccountSummary.js";
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
          <Statements client={selectedClient._id} />
          <AccountSummary client={selectedClient._id} />
        </>
      )}

      {selectedClient ? (
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
      ) : (
        <p>Client not found.</p>
      )}
    </div>
  );
};

const ClientDetails = ({ client }) => (
  <div className="details">
    <h4>{client.clientName}</h4>
    <p>
      <strong>Email:</strong> {client.clientEmail}
    </p>
    <p>
      <strong>Phone Number:</strong> {client.clientPhoneNumber}
    </p>
    <p>
      <strong>Address 1:</strong> {client.clientStreetLineOne}
    </p>
    <p>
      <strong>Address 2:</strong> {client.clientStreetLineTwo}
    </p>
    <p>
      <strong>City:</strong> {client.clientCity}
    </p>
    <p>
      <strong>State:</strong> {client.clientState}
    </p>
    <p>
      <strong>Zip Code:</strong> {client.clientZip}
    </p>
    <p>
      <strong>Cycle Date:</strong> {client.clientCycleDate}
    </p>
    <p>
      <strong>Automatic Statements: </strong>
      {client.clientAutoEmailStatementsEnabled ? "Yes" : "No"}
    </p>
    <p>
      Created:{" "}
      {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
    </p>
    <p>
      Updated:{" "}
      {formatDistanceToNow(new Date(client.updatedAt), { addSuffix: true })}
    </p>
    <UpdateClientModal key={`modal-${client._id}`} client={client} />
    <DeleteClientModal key={`delete-${client._id}`} client={client} />
  </div>
);

export default Profile;
