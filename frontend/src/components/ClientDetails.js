import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import UpdateClientModal from "./modals/UpdateClientModal";
import WarningClientInviteModal from "./modals/WarningClientInviteModal";

const ClientDetails = ({ client, handleShowToast }) => {
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
        <strong>Client Plan: </strong>
        {client.clientPlan}
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
      <div className="button-separator">
        <UpdateClientModal key={`update-${client._id}`} client={client} />

        {client && client.clientWelcomeEmailEnabled === false && (
          <WarningClientInviteModal
            key={`invite-${client._id}`}
            selectedClient={client}
            handleShowToast={handleShowToast}
          />
        )}
      </div>

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
