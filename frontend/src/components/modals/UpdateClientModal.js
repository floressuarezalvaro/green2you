import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useClientsContext } from "../../hooks/useClientsContext";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import ToggleSwitch from "../../utils/ToggleSwitch";

const UpdateClientModal = ({ client }) => {
  const { user, logout } = useAuthContext();
  const { dispatch } = useClientsContext();

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [error, setError] = useState(null);
  const [updateClientForm, setUpdateClientForm] = useState({
    clientName: client.clientName || "",
    clientEmail: client.clientEmail || "",
    clientPhoneNumber: client.clientPhoneNumber || "",
    clientStreetLineOne: client.clientStreetLineOne || "",
    clientStreetLineTwo: client.clientStreetLineTwo || "",
    clientCity: client.clientCity || "",
    clientState: client.clientState || "",
    clientZip: client.clientZip || "",
    clientCycleDate: client.clientCycleDate || "",
    clientStatementCreateDate: client.clientStatementCreateDate || "",
    clientPlan: client.clientPlan || "",
    clientMonthly: client.clientMonthly || false,
    clientAutoEmailStatementsEnabled:
      client.clientAutoEmailStatementsEnabled || false,
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdateClientForm({
      ...updateClientForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!user) {
      logout();
    }

    const response = await fetch("/api/clients/" + client._id, {
      method: "PUT",
      body: JSON.stringify(updateClientForm),
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
      dispatch({ type: "UPDATE_CLIENT", payload: json });
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
          <Modal.Title>Update Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="clientNameUpdateField">
              <Form.Label>Name of Client</Form.Label>
              <Form.Control
                type="text"
                value={updateClientForm.clientName}
                onChange={onChange}
                name="clientName"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="clientEmailField">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                value={updateClientForm.clientEmail}
                onChange={onChange}
                name="clientEmail"
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="clientPhoneNumberField">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="number"
                value={updateClientForm.clientPhoneNumber}
                onChange={onChange}
                name="clientPhoneNumber"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="clientStreetLineOneField">
              <Form.Label>Address 1</Form.Label>
              <Form.Control
                type="text"
                value={updateClientForm.clientStreetLineOne}
                onChange={onChange}
                name="clientStreetLineOne"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="clientStreetLineTwoField">
              <Form.Label>Address 2</Form.Label>
              <Form.Control
                type="text"
                value={updateClientForm.clientStreetLineTwo}
                onChange={onChange}
                name="clientStreetLineTwo"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="clientCityField">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                value={updateClientForm.clientCity}
                onChange={onChange}
                name="clientCity"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="clientState">
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                value={updateClientForm.clientState}
                onChange={onChange}
                name="clientState"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="clientZipField">
              <Form.Label>Zip Code</Form.Label>
              <Form.Control
                type="number"
                value={updateClientForm.clientZip}
                onChange={onChange}
                name="clientZip"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="clientCycleDateField">
              <Form.Label>Cycle End Date (1-31)</Form.Label>
              <Form.Control
                type="number"
                value={updateClientForm.clientCycleDate}
                onChange={onChange}
                name="clientCycleDate"
              />
            </Form.Group>

            <Form.Group
              className="mb-3"
              controlId="clientStatementCreateDateField"
            >
              <Form.Label>Statement Create Date (1-31)</Form.Label>
              <Form.Control
                type="number"
                value={updateClientForm.clientStatementCreateDate}
                onChange={onChange}
                name="clientStatementCreateDate"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="clientPlanField">
              <Form.Label>Client Plan</Form.Label>
              <Form.Control
                type="text"
                value={updateClientForm.clientPlan}
                onChange={onChange}
                name="clientPlan"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="clientMonthlyField">
              <Form.Label>Client Monthly</Form.Label>
              <ToggleSwitch
                checked={updateClientForm.clientMonthly}
                onChange={onChange}
                name="clientMonthly"
                id="clientMonthlyField"
              />
            </Form.Group>

            <Form.Group
              className="mb-3"
              controlId="clientAutoEmailStatementsEnabledField"
            >
              <Form.Label>Auto Email Statements</Form.Label>
              <ToggleSwitch
                checked={updateClientForm.clientAutoEmailStatementsEnabled}
                onChange={onChange}
                name="clientAutoEmailStatementsEnabled"
                id="clientAutoEmailStatementsEnabledField"
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

export default UpdateClientModal;
