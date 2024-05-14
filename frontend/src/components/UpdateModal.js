import { useState } from "react";
import { useInvoicesContext } from "../hooks/useInvoicesContext";
import { useAuthContext } from "../hooks/useAuthContext";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

function InvoiceModal() {
  const { dispatch, invoice } = useInvoicesContext();
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
  // const handleUpdate = async () => {
  //   if (!user) {
  //     return;
  //   }

  //   const response = await fetch("/invoices/" + invoice._id, {
  //     method: "PUT",
  //     headers: {
  //       Authorization: `Bearer ${user.token}`,
  //     },
  //   });

  //   // const json = await response.json();
  //   console.log(response, `This is the ${invoice._id}`);

  //   if (response.ok) {
  //     // dispatch({ type: "UPDATE_INVOICE", payload: json });
  //   }
  // };

  return (
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
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Name of Client</Form.Label>
              <Form.Control type="email" placeholder="tsting" autoFocus />
            </Form.Group>

            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Date of Service</Form.Label>
              <Form.Control type="email" placeholder="" autoFocus />
            </Form.Group>

            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="email"
                placeholder="name@example.com"
                autoFocus
              />
            </Form.Group>

            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Service Description</Form.Label>
              <Form.Control as="textarea" rows={3} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleDelete}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default InvoiceModal;
