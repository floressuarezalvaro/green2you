import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { format } from "date-fns";

import UpdateInvoiceModal from "./modals/UpdateInvoiceModal";
import DeleteInvoiceModal from "../components/modals/WarningDeleteInvoice";

const InvoiceDetails = ({ invoice, client, user, hideClientName = false }) => {
  const formattedDate = format(new Date(invoice.date), "MM/dd/yyyy");

  return (
    <div className="details">
      {!hideClientName && <h4>{client.clientName}</h4>}
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
            clientName={client.clientName}
          />
        </>
      )}
    </div>
  );
};

export default InvoiceDetails;
