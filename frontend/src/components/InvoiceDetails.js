import { useState, useEffect } from "react";
import { useClientsContext } from "../hooks/useClientsContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { format } from "date-fns";

import InvoiceModal from "./modals/InvoiceModal";
import DeleteInvoice from "../components/DeleteInvoice";

const InvoiceDetails = ({ invoice, hideClientName = false }) => {
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
        {invoice.amount}
      </p>
      <p>
        <strong>Service Description: </strong>
        {invoice.description}
      </p>
      <p>
        Created:{" "}
        {formatDistanceToNow(new Date(invoice.createdAt), { addSuffix: true })}
      </p>
      <p>
        Updated:{" "}
        {formatDistanceToNow(new Date(invoice.updatedAt), { addSuffix: true })}
      </p>
      <DeleteInvoice key={`delete-${invoice._id}`} invoice={invoice} />
      <InvoiceModal key={invoice._id} invoice={invoice} />
    </div>
  );
};

export default InvoiceDetails;
