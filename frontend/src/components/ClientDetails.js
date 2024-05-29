import formatDistanceToNow from "date-fns/formatDistanceToNow";
import ClientModal from "./modals/ClientModal";

const ClientDetails = ({ client }) => {
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
      <ClientModal key={client._id} client={client} />
    </div>
  );
};

export default ClientDetails;
