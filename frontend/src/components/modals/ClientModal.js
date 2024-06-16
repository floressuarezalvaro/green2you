import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

const ClientModal = ({ client }) => {
  const { user } = useAuthContext();
  // for modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // states for updating
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
  });

  const onChange = (e) => {
    setUpdateClientForm({
      ...updateClientForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Login required");
      return;
    }

    const response = await fetch("/clients/" + client._id, {
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
      window.location.reload();
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
                autoFocus
                onChange={onChange}
                name="clientName"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="clientEmailField">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                value={updateClientForm.clientEmail}
                autoFocus
                onChange={onChange}
                name="clientEmail"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="clientPhoneNumberField">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="number"
                value={updateClientForm.clientPhoneNumber}
                autoFocus
                onChange={onChange}
                name="clientPhoneNumber"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="clientStreetLineOneField">
              <Form.Label>Address 1</Form.Label>
              <Form.Control
                type="text"
                value={updateClientForm.clientStreetLineOne}
                autoFocus
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
              <Form.Label>Cycle Date</Form.Label>
              <Form.Control
                type="number"
                value={updateClientForm.clientCycleDate}
                onChange={onChange}
                name="clientCycleDate"
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

export default ClientModal;
