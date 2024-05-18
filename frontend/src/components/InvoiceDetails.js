import { useInvoicesContext } from "../hooks/useInvoicesContext";
import { useAuthContext } from "../hooks/useAuthContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import InvoiceModal from "../components/InvoiceModal";

const InvoiceDetails = ({ invoice }) => {
  const { dispatch } = useInvoicesContext();
  const { user } = useAuthContext();

  // deleting

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
    <div className="details">
      <h4>{invoice.clientName}</h4>
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
