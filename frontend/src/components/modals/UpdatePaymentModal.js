import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { usePaymentsContext } from "../../hooks/usePaymentsContext";
import { useClientsContext } from "../../hooks/useClientsContext";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

const UpdatePaymentModal = ({ payment }) => {
  const { user, logout } = useAuthContext();
  const { clients = [] } = useClientsContext();
  const { dispatch } = usePaymentsContext();
  const [clientName, setClientName] = useState("");

  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);

  const initializeForm = () => ({
    checkDate: payment.checkDate
      ? new Date(payment.checkDate).toISOString().split("T")[0]
      : "",
    amount: payment.amount,
    checkNumber: payment.checkNumber,
    memo: payment.memo,
  });

  const [updatePaymentForm, setUpdatePaymentForm] = useState(initializeForm());

  useEffect(() => {
    if (payment.clientId && clients && clients.length > 0) {
      const client = clients.find((client) => client._id === payment.clientId);
      if (client) {
        setClientName(client.clientName);
      }
    }
  }, [payment.clientId, clients]);

  const handleShow = () => {
    setUpdatePaymentForm(initializeForm());
    setShow(true);
  };

  const handleClose = () => setShow(false);

  const onChange = (e) => {
    setUpdatePaymentForm({
      ...updatePaymentForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!user) {
      logout();
    }

    const response = await fetch("/api/payments/" + payment._id, {
      method: "PUT",
      body: JSON.stringify(updatePaymentForm),
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();

    if (!response.ok) {
      setError(json.error);
    }
    if (response.ok) {
      dispatch({ type: "UPDATE_PAYMENT", payload: json });
      handleClose();
    }
  };

  return (
    <div className="modal-show">
      <Button variant="primary" onClick={handleShow}>
        Update
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="clientNameUpdateField">
              <Form.Label>Name of Client</Form.Label>
              <Form.Control
                type="text"
                placeholder={clientName || "Loading..."}
                autoFocus
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="amountUpdateField">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                value={updatePaymentForm.amount}
                onChange={onChange}
                name="amount"
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="checkDateUpdateField">
              <Form.Label>Check Date</Form.Label>
              <Form.Control
                type="date"
                value={updatePaymentForm.checkDate}
                onChange={onChange}
                name="checkDate"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="checkNumberUpdateField">
              <Form.Label>Check Number </Form.Label>
              <Form.Control
                type="number"
                value={updatePaymentForm.checkNumber}
                onChange={onChange}
                name="checkNumber"
                onWheel={(e) => e.target.blur()}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="memoUpdateField">
              <Form.Label>Memo </Form.Label>
              <Form.Control
                type="text"
                value={updatePaymentForm.memo}
                onChange={onChange}
                name="memo"
              />
            </Form.Group>

            {error && <div className="error">{error}</div>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UpdatePaymentModal;
