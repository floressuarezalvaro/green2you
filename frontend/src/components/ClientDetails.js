import { useClientsContext } from "../hooks/useClientsContext";
import { useAuthContext } from "../hooks/useAuthContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

const ClientDetails = ({ clients }) => {
  const { dispatch } = useClientsContext();
  const { user } = useAuthContext();

  const handleDelete = async () => {
    if (!user) {
      return;
    }

    const response = await fetch("/clients/" + clients._id, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    const json = await response.json();

    if (response.ok) {
      dispatch({ type: "DELETE_CLIENTS", payload: json });
    }
  };

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
      <span className="material-symbols-outlined" onClick={handleDelete}>
        delete
      </span>
      {/* <InvoiceModal key={invoice._id} invoice={invoice} /> */}
    </div>
  );
};

export default ClientDetails;
