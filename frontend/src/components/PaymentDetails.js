import { useState, useEffect } from "react";
import { useClientsContext } from "../hooks/useClientsContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { format } from "date-fns";

import DeletePaymentModal from "../components/modals/WarningDeletePayment";
import UpdatePaymentModal from "./modals/UpdatePaymentModal";

const PaymentDetails = ({ payment }) => {
  const { clients = [] } = useClientsContext();
  const [clientName, setClientName] = useState("");

  const formattedDate = format(new Date(payment.checkDate), "MM/dd/yyyy");

  useEffect(() => {
    if (payment.clientId && clients && clients.length > 0) {
      const client = clients.find((client) => client._id === payment.clientId);
      if (client) {
        setClientName(client.clientName);
      }
    }
  }, [payment.clientId, clients]);

  return (
    <div className="details">
      {<h4>{clientName}</h4>}
      <p>
        <strong>Check Date: </strong>
        {formattedDate}
      </p>
      <p>
        <strong>Statement ID: </strong>
        {payment.statementId}
      </p>
      <p>
        <strong>Amount: </strong>
        {payment.amount}
      </p>
      <p>
        <strong>Check Number: </strong>
        {payment.checkNumber}
      </p>
      <p>
        <strong>Memo: </strong>
        {payment.memo}
      </p>
      <p>
        Created:{" "}
        {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
      </p>
      <p>
        Updated:{" "}
        {formatDistanceToNow(new Date(payment.updatedAt), { addSuffix: true })}
      </p>
      <DeletePaymentModal key={`delete-${payment._id}`} payment={payment} />
      <UpdatePaymentModal key={payment._id} payment={payment} />
    </div>
  );
};

export default PaymentDetails;
