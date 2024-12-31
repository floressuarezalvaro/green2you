import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { format } from "date-fns";

import DeletePaymentModal from "../components/modals/WarningDeletePayment";
import UpdatePaymentModal from "./modals/UpdatePaymentModal";

const PaymentDetails = ({ payment, client }) => {
  const formattedDate = format(new Date(payment.checkDate), "MM/dd/yyyy");

  return (
    <div className="details">
      <h4>{client?.clientName || "Unknown Client"}</h4>
      <p>
        <strong>Check Date: </strong>
        {formattedDate}
      </p>
      <p>
        <strong>Amount: </strong> ${payment.amount.toFixed(2)}
      </p>
      <p>
        <strong>Check Number: </strong>
        {payment.checkNumber}
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
