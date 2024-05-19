import { useState } from "react";
// import { useInvoicesContext } from "../../hooks/useInvoicesContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

const InvoiceModal = ({ invoice }) => {
  // const { dispatch } = useInvoicesContext();
  const { user } = useAuthContext();
  //   for modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  //   states for updating
  const [error, setError] = useState(null);
  const [updateInvoiceForm, setUpdateInvoiceForm] = useState();

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
      // dispatch({ type: "UPDATE_INVOICE", payload: json });
    }
  };

  return (
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
            <Form.Group className="mb-3" controlId="clientNameUpdateField">
              <Form.Label>Name of Client</Form.Label>
              <Form.Control
                type="text"
                placeholder={invoice.clientName}
                autoFocus
                onChange={onChange}
                name="clientName"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="dateUpdateField">
              <Form.Label>Date of Service</Form.Label>
              <Form.Control
                type="date"
                placeholder={invoice.date}
                autoFocus
                onChange={onChange}
                name="date"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="priceUpdateField">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                placeholder={invoice.price}
                autoFocus
                onChange={onChange}
                name="price"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="descriptionUpdateField">
              <Form.Label>Service Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={invoice.description}
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
