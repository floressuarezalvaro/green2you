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
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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

  const handleUpdate = async () => {
    if (!user) {
      return;
    }

    const response = await fetch("/invoices/" + invoice._id, {
      method: "PUT",
      body: JSON.stringify({
        clientName: "Update Worked",
        price: 100,
      }),
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();

    if (response.ok) {
      dispatch({ type: "UPDATE_INVOICE", payload: json });
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
            <Modal.Title>Modal heading</Modal.Title>
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
                />
              </Form.Group>

              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Label>Date of Service</Form.Label>
                <Form.Control
                  type="number"
                  placeholder={invoice.date}
                  autoFocus
                />
              </Form.Group>

              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="email"
                  placeholder={invoice.price}
                  autoFocus
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
                />
              </Form.Group>
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
