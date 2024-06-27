import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import ClientModal from "./modals/ClientModal";

const ClientDetails = ({ client }) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleProfileRedirect = async (e) => {
    e.preventDefault();
    if (!user) {
      return;
    }

    try {
      navigate(`/profile/${client._id}`);
    } catch (error) {
      console.error("Failed to log ");
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
      <ClientModal key={client._id} client={client} />
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
