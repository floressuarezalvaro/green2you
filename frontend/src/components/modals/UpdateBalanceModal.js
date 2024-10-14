import { useState } from "react";

import { useAuthContext } from "../../hooks/useAuthContext";
import { useBalancesContext } from "../../hooks/useBalancesContext";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

const UpdateBalanceModal = ({ balances }) => {
  const { user, logout } = useAuthContext();
  const { dispatch } = useBalancesContext();

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [error, setError] = useState(null);

  const [updateBalanceForm, setUpdateBalanceForm] = useState({
    previousStatementBalance: balances.previousStatementBalance,
    paymentsOrCredits: balances.paymentsOrCredits,
    serviceDues: balances.serviceDues,
    newStatementBalance: balances.newStatementBalance,
  });

  const onChange = (e) => {
    setUpdateBalanceForm({
      ...updateBalanceForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!user) {
      logout();
    }

    const response = await fetch("/api/balances/" + balances._id, {
      method: "PUT",
      body: JSON.stringify(updateBalanceForm),
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
      dispatch({ type: "SET_BALANCE", payload: json });
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
          <Modal.Title>Update Balance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group
              className="mb-3"
              controlId="previousStatementBalanceField"
            >
              <Form.Label>Previous Statement Balance:</Form.Label>
              <Form.Control
                type="number"
                value={updateBalanceForm.previousStatementBalance}
                onChange={onChange}
                name="previousStatementBalance"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="paymentsOrCreditsField">
              <Form.Label>Payments and Credits: </Form.Label>
              <Form.Control
                type="number"
                value={updateBalanceForm.paymentsOrCredits}
                onChange={onChange}
                name="paymentsOrCredits"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="serviceDuesField">
              <Form.Label>Service Dues: </Form.Label>
              <Form.Control
                type="number"
                value={updateBalanceForm.serviceDues}
                onChange={onChange}
                name="serviceDues"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="newStatementBalanceField">
              <Form.Label>New Statement Balance: </Form.Label>
              <Form.Control
                type="number"
                value={updateBalanceForm.newStatementBalance}
                onChange={onChange}
                name="newStatementBalance"
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

export default UpdateBalanceModal;
