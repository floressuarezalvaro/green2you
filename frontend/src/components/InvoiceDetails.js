import { useState, useEffect } from "react";
import { useInvoicesContext } from "../hooks/useInvoicesContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { useClientsContext } from "../hooks/useClientsContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { format } from "date-fns";

import InvoiceModal from "./modals/InvoiceModal";

const InvoiceDetails = ({ invoice }) => {
  const { dispatch } = useInvoicesContext();
  const { user } = useAuthContext();
  const { clients } = useClientsContext();
  const [clientName, setClientName] = useState("");

  useEffect(() => {
    if (invoice.clientId) {
      const client = clients.find((client) => client._id === invoice.clientId);
      if (client) {
        setClientName(client.clientName);
      }
    }
  }, [invoice.clientId, clients]);

  // Deleting
  const handleDelete = async () => {
    if (!user) {
      return;
    }

    const response = await fetch("/invoices/" + invoice._id, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    const json = await response.json();

    if (response.ok) {
      dispatch({ type: "DELETE_INVOICE", payload: json });
    }
  };

  const formattedDate = format(new Date(invoice.date), "MM/dd/yyyy");

  return (
    <div className="details">
      <h4>{clientName}</h4>
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
      <span className="material-symbols-outlined" onClick={handleDelete}>
        delete
      </span>
      <InvoiceModal key={invoice._id} invoice={invoice} />
    </div>
  );
};

export default InvoiceDetails;
