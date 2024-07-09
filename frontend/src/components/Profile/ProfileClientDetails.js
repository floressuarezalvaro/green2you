import formatDistanceToNow from "date-fns/formatDistanceToNow";
import UpdateClientModal from "../modals/UpdateClientModal";
import DeleteClientModal from "../modals/WarningDeleteClient";

const ClientDetails = ({ client, user }) => (
  <div className="details">
    <h4>{client.clientName}</h4>
    <p>
      <strong>Email:</strong> {client.clientEmail}
    </p>
    <p>
      <strong>Phone Number:</strong> {client.clientPhoneNumber}
    </p>
    <p>
      <strong>Address 1:</strong> {client.clientStreetLineOne}
    </p>
    <p>
      <strong>Address 2:</strong> {client.clientStreetLineTwo}
    </p>
    <p>
      <strong>City:</strong> {client.clientCity}
    </p>
    <p>
      <strong>State:</strong> {client.clientState}
    </p>
    <p>
      <strong>Zip Code:</strong> {client.clientZip}
    </p>
    <p>
      <strong>Cycle Date:</strong> {client.clientCycleDate}
    </p>
    <p>
      Created:{" "}
      {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
    </p>
    <p>
      Updated:{" "}
      {formatDistanceToNow(new Date(client.updatedAt), { addSuffix: true })}
    </p>
    {user && user === "admin" && (
      <>
        <UpdateClientModal key={`modal-${client._id}`} client={client} />
        <DeleteClientModal key={`delete-${client._id}`} client={client} />
      </>
    )}
  </div>
);

export default ClientDetails;
