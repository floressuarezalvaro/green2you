import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useClientsContext } from "../hooks/useClientsContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import moment from "moment-timezone";

import EmailStatementModal from "../components/modals/WarningEmailStatement";
import DeleteStatementModal from "./modals/WarningDeleteStatement";
import MakePaymentModal from "./modals/MakePaymentModal";
import PrintStatement from "../utils/PrintStatement";

const StatementDetails = ({ statement, handleShowToast }) => {
  const { user } = useAuthContext();
  const { clients = [] } = useClientsContext();
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const handleClick = async (e, id, download) => {
    e.preventDefault();
    PrintStatement(user, id, download);
  };

  useEffect(() => {
    if (statement.clientId && clients && clients.length > 0) {
      const client = clients.find(
        (client) => client._id === statement.clientId
      );
      if (client) {
        setClientName(client.clientName);
        setClientEmail(client.clientEmail);
      }
    }
  }, [statement.clientId, clients]);

  const startDate = moment
    .tz(statement.issuedStartDate, "UTC")
    .tz("America/Los_Angeles");
  const endDate = moment
    .tz(statement.issuedEndDate, "UTC")
    .tz("America/Los_Angeles");

  const createdDate = moment
    .tz(statement.createdAt, "UTC")
    .tz("America/Los_Angeles");

  const formattedStartDate = startDate.format("MMMM D, YYYY");
  const formattedEndDate = endDate.format("MMMM D, YYYY");
  const formattedCreatedDate = createdDate.format("MMMM D, YYYY");

  return (
    <div className="details">
      {<h4>{clientName}</h4>}
      <p>
        <strong>Issued Start Date: </strong>
        {formattedStartDate}
      </p>
      <p>
        <strong>Issued End Date: </strong>
        {formattedEndDate}
      </p>
      <p>
        <strong>Statement Created Date: </strong>
        {formattedCreatedDate}
      </p>
      <p>
        <strong>Amount Due: </strong> ${statement.totalAmount.toFixed(2)}
      </p>

      {statement.paidAmount > 0 && (
        <p>
          <strong>Amount Paid:</strong> ${statement.paidAmount.toFixed(2)}
        </p>
      )}

      <p>
        Created:{" "}
        {formatDistanceToNow(new Date(statement.createdAt), {
          addSuffix: true,
        })}
      </p>
      <p>
        Updated:{" "}
        {formatDistanceToNow(new Date(statement.updatedAt), {
          addSuffix: true,
        })}
      </p>
      <DeleteStatementModal
        key={`delete-${statement._id}`}
        statement={statement}
      />
      <div className="button-separator">
        <button
          onClick={(e) => handleClick(e, statement._id, false)}
          className="material-symbols-outlined"
        >
          open_in_new
        </button>

        <button
          onClick={(e) => handleClick(e, statement._id, true)}
          className="material-symbols-outlined"
        >
          download
        </button>

        <EmailStatementModal
          key={`email-${statement._id}`}
          clientName={clientName}
          clientEmail={clientEmail}
          statement={statement}
          handleShowToast={handleShowToast}
        />
        {statement.isPaid === false && (
          <MakePaymentModal
            clientName={clientName}
            key={`payment-${statement._id}`}
            statement={statement}
            handleShowToast={handleShowToast}
          />
        )}
      </div>
    </div>
  );
};

export default StatementDetails;
