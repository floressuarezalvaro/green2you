import { useState } from "react";
import { useInvoicesContext } from "../hooks/useInvoicesContext";
import { useAuthContext } from "../hooks/useAuthContext";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

import formatDistanceToNow from "date-fns/formatDistanceToNow";

const InvoiceDetails = ({ invoice }) => {
  const { dispatch } = useInvoicesContext();
  const { user } = useAuthContext();

  // for modal
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // states for updating
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!user) {
      return;
    }

    const response = await fetch("/invoices/" + invoice._id, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    const json = await response.json();

    if (response.ok) {
      dispatch({ type: "DELETE_INVOICE", payload: json });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Login required");
      return;
    }

    const updatedInvoice = {
      clientName,
      date,
      price,
      description,
    };

    const updateResponse = await fetch("/invoices/" + invoice._id, {
      method: "PUT",
      body: JSON.stringify(updatedInvoice),
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
    });

    console.log(updatedInvoice);
    const updatedJson = await updateResponse.json();

    if (!updatedJson.ok) {
      setError(updatedJson.error);
    }
    if (updatedJson.ok) {
      dispatch({ type: "UPDATE_INVOICE", payload: updatedJson });
    }
  };

  return (
    <div className="invoice-details">
      <h4>{invoice.clientName}</h4>
      <p>
        <strong>Date of Service: </strong>
        {invoice.date}
      </p>
      <p>
        <strong>Price (USD): </strong>
        {invoice.price}
      </p>
      <p>
        <strong>Service Description: </strong>
        {invoice.description}
      </p>
      <p>
        Created:{" "}
        {formatDistanceToNow(new Date(invoice.createdAt), { addSuffix: true })}
      </p>
      <span className="material-symbols-outlined" onClick={handleDelete}>
        delete
      </span>
      <div className="modal-show" style={{}}>
        <Button variant="primary" onClick={handleShow}>
          Update
        </Button>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Update Form</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Label>Name of Client</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={invoice.clientName}
                  autoFocus
                  onChange={(e) => setClientName(e.target.value)}
                  value={clientName}
                />
              </Form.Group>

              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Label>Date of Service</Form.Label>
                <Form.Control
                  type="date"
                  placeholder={invoice.date}
                  autoFocus
                  onChange={(e) => setDate(e.target.value)}
                  value={date}
                />
              </Form.Group>

              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  placeholder={invoice.price}
                  autoFocus
                  onChange={(e) => setPrice(e.target.value)}
                  value={price}
                />
              </Form.Group>

              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlTextarea1"
              >
                <Form.Label>Service Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder={invoice.description}
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
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
    </div>
  );
};

export default InvoiceDetails;
