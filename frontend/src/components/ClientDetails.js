import { useClientsContext } from "../hooks/useClientsContext";
import { useAuthContext } from "../hooks/useAuthContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import ClientModal from "./modals/ClientModal";

const ClientDetails = ({ client }) => {
  const { dispatch } = useClientsContext();
  const { user } = useAuthContext();

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!user) {
      return;
    }

    const response = await fetch("/clients/" + client._id, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    const json = await response.json();

    if (response.ok) {
      dispatch({ type: "DELETE_CLIENT", payload: json });
    }
  };

  return (
    <div className="details">
      <h4>{client.clientName}</h4>
      <p>
        <strong>Email: </strong>
        {client.clientEmail}
      </p>
      <p>
        <strong>Phone Number: </strong>
        {client.clientPhoneNumber}
      </p>
      <p>
        Created:{" "}
        {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
      </p>
      <p>
        Updated:{" "}
        {formatDistanceToNow(new Date(client.updatedAt), { addSuffix: true })}
      </p>
      <span className="material-symbols-outlined" onClick={handleDelete}>
        delete
      </span>
      <ClientModal key={client._id} client={client} />
    </div>
  );
};

export default ClientDetails;
