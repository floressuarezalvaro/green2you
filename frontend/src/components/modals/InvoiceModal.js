import { useState, useEffect } from "react";
import { useClientsContext } from "../../hooks/useClientsContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

const InvoiceModal = ({ invoice }) => {
  const { clients = [] } = useClientsContext(); // Ensure clients is always an array
  const [clientName, setClientName] = useState(""); // Initialize with an empty string
  const { user } = useAuthContext();
  // for modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // states for updating
  const [error, setError] = useState(null);
  const [updateInvoiceForm, setUpdateInvoiceForm] = useState({
    date: invoice.date
      ? new Date(invoice.date).toISOString().split("T")[0]
      : "",
    amount: invoice.amount,
    description: invoice.description,
  });

  useEffect(() => {
    if (invoice.clientId && clients.length > 0) {
      const client = clients.find((client) => client._id === invoice.clientId);
      if (client) {
        setClientName(client.clientName);
      }
    }
  }, [invoice.clientId, clients]);

  const onChange = (e) => {
    setUpdateInvoiceForm({
      ...updateInvoiceForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Login required");
      return;
    }

    const response = await fetch("/invoices/" + invoice._id, {
      method: "PUT",
      body: JSON.stringify(updateInvoiceForm),
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
          <Modal.Title>Update Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="clientNameUpdateField">
              <Form.Label>Name of Client</Form.Label>
              <Form.Control
                type="text"
                placeholder={clientName || "Loading..."} // Handle loading state
                autoFocus
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="dateUpdateField">
              <Form.Label>Date of Service</Form.Label>
              <Form.Control
                type="date"
                value={updateInvoiceForm.date}
                onChange={onChange}
                name="date"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="amountUpdateField">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                value={updateInvoiceForm.amount}
                onChange={onChange}
                name="amount"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="descriptionUpdateField">
              <Form.Label>Service Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={updateInvoiceForm.description}
                onChange={onChange}
                name="description"
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

export default InvoiceModal;
