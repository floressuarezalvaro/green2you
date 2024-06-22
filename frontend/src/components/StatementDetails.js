import { useState, useEffect } from "react";
import { useClientsContext } from "../hooks/useClientsContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { format } from "date-fns";

// import InvoiceModal from "./modals/InvoiceModal";
import DeleteStatementModal from "../components/modals/WarningDeleteStatement";
// import { useStatementsContext } from "../hooks/useStatementsContext";

const StatementDetails = ({ statement }) => {
  const { clients = [] } = useClientsContext();
  const [clientName, setClientName] = useState("");

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

  const formattedStartDate = format(
    new Date(statement.issuedStartDate),
    "MM/dd/yyyy"
  );
  const formattedEndDate = format(
    new Date(statement.issuedEndDate),
    "MM/dd/yyyy"
  );

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
      {/* <InvoiceModal key={invoice._id} invoice={invoice} />  */}
    </div>
  );
};

export default StatementDetails;
