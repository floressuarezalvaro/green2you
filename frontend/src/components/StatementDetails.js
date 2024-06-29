import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useClientsContext } from "../hooks/useClientsContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import moment from "moment-timezone";

import EmailStatementModal from "../components/modals/WarningEmailStatement";
import DeleteStatementModal from "./modals/WarningDeleteStatement";
import MakePayment from "./modals/PaymentModal";
import PrintStatement from "../utils/PrintStatement";

const StatementDetails = ({ statement, handleShowToast }) => {
  const { user } = useAuthContext();
  const { clients = [] } = useClientsContext();
  const [clientName, setClientName] = useState("");

  const handleClick = async (e, id) => {
    e.preventDefault();
    PrintStatement(user, id);
  };

  useEffect(() => {
    if (statement.clientId && clients && clients.length > 0) {
      const client = clients.find(
        (client) => client._id === statement.clientId
      );
      if (client) {
        setClientName(client.clientName);
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
        <strong>Total Amount(USD): </strong>
        {statement.totalAmount}
      </p>
      <p>
        <strong>Service Description: </strong>
        {statement.description}
      </p>
      <p>
        Created:{" "}
        {formatDistanceToNow(new Date(statement.createdAt), {
          addSuffix: true,
        })}
      </p>
      <DeleteStatementModal
        key={`delete-${statement._id}`}
        statement={statement}
      />
      <div className="button-separator">
        <EmailStatementModal
          key={statement._id}
          statement={statement}
          handleShowToast={handleShowToast}
        />
        <MakePayment
          // key={statement._id}
          statement={statement}
          handleShowToast={handleShowToast}
        />
        <button
          onClick={(e) => handleClick(e, statement._id)}
          className="material-symbols-outlined"
        >
          open_in_new
        </button>
      </div>
    </div>
  );
};

export default StatementDetails;
