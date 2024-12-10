import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

const MakePaymentModal = ({ statement, clientName }) => {
  const { user, logout } = useAuthContext();

  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);

  const initializeForm = () => ({
    clientId: statement.clientId,
    statementId: statement._id,
    type: "credit",
    amount: statement.totalAmount,
    checkNumber: "",
    checkDate: "",
  });

  const [makePaymentForm, setMakePaymentForm] = useState(initializeForm());

  const handleShow = () => {
    setMakePaymentForm(initializeForm());
    setShow(true);
  };

  const handleClose = () => setShow(false);

  const onChange = (e) => {
    setMakePaymentForm({
      ...makePaymentForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!user) {
      logout();
    }

    const response = await fetch("/api/payments", {
      method: "POST",
      body: JSON.stringify(makePaymentForm),
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
      handleClose();
      window.location.reload();
    }
  };

  return (
    <div className="modal-show">
      <button onClick={handleShow} className="material-symbols-outlined">
        payments
      </button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Record Payment</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="amountField">
              <Form.Label>Client Name</Form.Label>
              <Form.Control
                type="text"
                value={clientName}
                name="name"
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="amountField">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                value={makePaymentForm.amount.toFixed(2)}
                onChange={onChange}
                name="amount"
                onWheel={(e) => e.target.blur()}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="checkNumberField">
              <Form.Label>Check Number</Form.Label>
              <Form.Control
                type="text"
                value={makePaymentForm.checkNumber}
                onChange={onChange}
                name="checkNumber"
                onWheel={(e) => e.target.blur()}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="checkDateField">
              <Form.Label>Check Date</Form.Label>
              <Form.Control
                type="date"
                value={makePaymentForm.checkDate}
                onChange={onChange}
                name="checkDate"
              />
            </Form.Group>

            {error && <div className="error">{error}</div>}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>

          <Button variant="success" onClick={handlePayment}>
            Record Payment
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MakePaymentModal;
