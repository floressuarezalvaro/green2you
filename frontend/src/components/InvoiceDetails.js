import { useInvoicesContext } from "../hooks/useInvoicesContext";
import { useAuthContext } from "../hooks/useAuthContext";
import InvoiceModal from "./UpdateModal";

import formatDistanceToNow from "date-fns/formatDistanceToNow";

const InvoiceDetails = ({ invoice }) => {
  const { dispatch } = useInvoicesContext();
  const { user } = useAuthContext();
  const useInvoiceModal = InvoiceModal();

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

  return (
    <div className="invoice-details">
      <h4>{invoice.clientName}</h4>
      <p>
        <strong>Invoice Number: </strong>
        {invoice.invoiceNumber}
      </p>
      <p>
        <strong>Date of Service: </strong>
        {invoice.date}
      </p>
      <p>
        <strong>Price (USD): </strong>
        {invoice.price}
      </p>
      <p>
        <strong>Service Description: </strong>
        {invoice.description}
      </p>
      <p>
        Created:{" "}
        {formatDistanceToNow(new Date(invoice.createdAt), { addSuffix: true })}
      </p>
      <span className="material-symbols-outlined" onClick={handleDelete}>
        delete
      </span>
      <div>{useInvoiceModal}</div>
    </div>
  );
};

export default InvoiceDetails;
