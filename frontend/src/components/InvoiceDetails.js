import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useClientsContext } from "../hooks/useClientsContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { format } from "date-fns";

import UpdateInvoiceModal from "./modals/UpdateInvoiceModal";
import DeleteInvoiceModal from "../components/modals/WarningDeleteInvoice";

const InvoiceDetails = ({ invoice, hideClientName = false }) => {
  const { user } = useAuthContext();
  const { clients = [] } = useClientsContext();
  const [clientName, setClientName] = useState("");

  useEffect(() => {
    if (invoice.clientId && clients && clients.length > 0) {
      const client = clients.find((client) => client._id === invoice.clientId);
      if (client) {
        setClientName(client.clientName);
      }
    }
  }, [invoice.clientId, clients]);

  const formattedDate = format(new Date(invoice.date), "MM/dd/yyyy");

  return (
    <div className="details">
      {!hideClientName && <h4>{clientName}</h4>}
      <p>
        <strong>Date of Service: </strong>
        {formattedDate}
      </p>
      <p>
        <strong>Amount(USD): </strong>
        {invoice.amount.toFixed(2)}
      </p>

      {invoice.description && (
        <p>
          <strong>Service Description: </strong>
          {invoice.description}
        </p>
      )}

      <p>
        Created:{" "}
        {formatDistanceToNow(new Date(invoice.createdAt), { addSuffix: true })}
      </p>
      <p>
        Updated:{" "}
        {formatDistanceToNow(new Date(invoice.updatedAt), { addSuffix: true })}
      </p>
      {user && user.role === "admin" && (
        <>
          <DeleteInvoiceModal key={`delete-${invoice._id}`} invoice={invoice} />
          <UpdateInvoiceModal
            key={invoice._id}
            invoice={invoice}
            clientName={clientName}
          />
        </>
      )}
    </div>
  );
};

export default InvoiceDetails;
