// import { useClientsContext } from "../hooks/useClientContext";
// import { useAuthContext } from "../hooks/useAuthContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

const ClientDetails = ({ clients }) => {
  //   const { dispatch } = useClientsContext();
  //   const { user } = useAuthContext();

  return (
    <div className="clients-details">
      <h4>{clients.clientName}</h4>
      {/* <p>
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
      </p> */}
      <p>
        Created:{" "}
        {formatDistanceToNow(new Date(clients.createdAt), { addSuffix: true })}
      </p>
      <p>
        Updated:{" "}
        {formatDistanceToNow(new Date(clients.updatedAt), { addSuffix: true })}
      </p>
      {/* <span className="material-symbols-outlined" onClick={handleDelete}>
        delete
      </span> */}
      {/* <InvoiceModal key={invoice._id} invoice={invoice} /> */}
    </div>
  );
};

export default ClientDetails;
