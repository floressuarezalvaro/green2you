// import { useClientsContext } from "../hooks/useClientContext";
// import { useAuthContext } from "../hooks/useAuthContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

const ClientDetails = ({ clients }) => {
  //   const { dispatch } = useClientsContext();
  //   const { user } = useAuthContext();

  return (
    <div className="details">
      <h4>{clients.clientName}</h4>
      <p>
        <strong>Email: </strong>
        {clients.clientEmail}
      </p>
      <p>
        <strong>Phone Number: </strong>
        {clients.clientPhoneNumber}
      </p>
      <p>
        <strong>Address 1: </strong>
        {clients.clientStreetLineOne}
      </p>
      <p>
        <strong>Address 2: </strong>
        {clients.clientStreetLineTwo}
      </p>
      <p>
        <strong>City: </strong>
        {clients.clientCity}
      </p>
      <p>
        <strong>State: </strong>
        {clients.clientState}
      </p>
      <p>
        <strong>Zip Code: </strong>
        {clients.clientZip}
      </p>
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
