import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import UpdateClientModal from "./modals/UpdateClientModal";

const ClientDetails = ({ client }) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleProfileRedirect = (e) => {
    e.preventDefault();
    if (user && client._id) {
      navigate(`/profile/${client._id}`);
    } else {
      console.error("User not logged in or client ID missing");
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
        <strong>Weekly Plan: </strong>
        {client.clientPlanWeekly}
      </p>
      <p>
        <strong>Biweekly Plan: </strong>
        {client.clientPlanBiweekly}
      </p>
      <p>
        <strong>Cycle End Date: </strong>
        {client.clientCycleDate}
      </p>
      <p>
        <strong>Statement Create Date: </strong>
        {client.clientStatementCreateDate}
      </p>
      <p>
        <strong>Auto Email Statements: </strong>
        {client.clientAutoEmailStatementsEnabled ? "Yes" : "No"}
      </p>
      <p>
        Created:{" "}
        {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
      </p>
      <p>
        Updated:{" "}
        {formatDistanceToNow(new Date(client.updatedAt), { addSuffix: true })}
      </p>
      <UpdateClientModal key={client._id} client={client} />
      <span
        className="material-symbols-outlined"
        onClick={handleProfileRedirect}
      >
        account_circle
      </span>
    </div>
  );
};

export default ClientDetails;
