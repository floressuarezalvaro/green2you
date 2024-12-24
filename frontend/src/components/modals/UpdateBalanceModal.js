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
  const [error, setError] = useState(null);

  const initializeForm = () => ({
    currentBalance: balances.currentBalance,
  });

  const [updateBalanceForm, setUpdateBalanceForm] = useState(initializeForm());

  const handleShow = () => {
    setUpdateBalanceForm(initializeForm());
    setShow(true);
  };

  const handleClose = () => setShow(false);

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
              <Form.Label>Current Balance: </Form.Label>
              <Form.Control
                type="number"
                value={updateBalanceForm.currentBalance}
                onChange={onChange}
                name="currentBalance"
                onWheel={(e) => e.target.blur()}
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
