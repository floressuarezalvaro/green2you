import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useInvoicesContext } from "../hooks/useInvoicesContext";
import { useClientsContext } from "../hooks/useClientsContext";
import { useAuthContext } from "../hooks/useAuthContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import ClientModal from "../components/modals/ClientModal";
import InvoiceModal from "../components/modals/InvoiceModal";
import DeleteInvoice from "../components/DeleteInvoice";
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
    <div className="invoices">
      <h3>Profile Page</h3>

      {selectedClient && <ClientDetails client={selectedClient} />}

      {selectedClient && invoices?.length > 0 && (
        <>
          <h5>Statements</h5>
          <Statements client={selectedClient._id} user={user} />
          <h5>Invoices</h5>
          <InvoiceList invoices={invoices} />
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

const InvoiceList = ({ invoices }) => (
  <>
    {invoices.map((invoice) => (
      <div key={invoice._id} className="details">
        <p>
          <strong>Invoice ID:</strong> {invoice._id}
        </p>
        <p>
          <strong>Date of Service:</strong> {invoice.date}
        </p>
        <p>
          <strong>Amount (USD):</strong> {invoice.amount}
        </p>
        <p>
          <strong>Service Description:</strong> {invoice.description}
        </p>
        <InvoiceModal key={`modal-${invoice._id}`} invoice={invoice} />
        <DeleteInvoice key={`delete-${invoice._id}`} invoice={invoice} />
      </div>
    ))}
  </>
);

export default Profile;
