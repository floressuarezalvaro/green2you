import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useInvoicesContext } from "../hooks/useInvoicesContext";
import { useClientsContext } from "../hooks/useClientsContext";
import { useAuthContext } from "../hooks/useAuthContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import ClientModal from "../components/modals/ClientModal";
import InvoiceDetails from "../components/InvoiceDetails";
import DeleteClient from "../components/DeleteClient";
import Statements from "../components/Statements";

const Profile = () => {
  const { clientId } = useParams();
  const { invoices, dispatch } = useInvoicesContext();
  const { clients } = useClientsContext();
  const { user } = useAuthContext();

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
            // Handle unauthorized
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
  }, [dispatch, user, clientId]);

  const selectedClient =
    clients?.find((client) => client._id === clientId) || null;

  return (
    <div className="profile">
      <h3>Profile Page</h3>

      {selectedClient && <ClientDetails client={selectedClient} />}

      {selectedClient && invoices?.length > 0 && (
        <>
          <div className="statements-wrapper">
            <h5>Statements</h5>
            <Statements client={selectedClient._id} />
          </div>
          <h5>Invoices</h5>
          {invoices &&
            invoices.map((invoice) => (
              <InvoiceDetails
                key={invoice._id}
                invoice={invoice}
                hideClientName={true}
              />
            ))}
        </>
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
      {client.clientAutoStatementsEnabled ? "Yes" : "No"}
    </p>
    <p>
      Created:{" "}
      {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
    </p>
    <p>
      Updated:{" "}
      {formatDistanceToNow(new Date(client.updatedAt), { addSuffix: true })}
    </p>
    <ClientModal key={`modal-${client._id}`} client={client} />
    <DeleteClient key={`delete-${client._id}`} client={client} />
  </div>
);

export default Profile;
