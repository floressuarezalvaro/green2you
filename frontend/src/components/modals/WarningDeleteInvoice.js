import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useInvoicesContext } from "../../hooks/useInvoicesContext";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const DeleteInvoiceModal = ({ invoice }) => {
  const { user } = useAuthContext();
  const { dispatch } = useInvoicesContext();

  // for modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleDelete = async (e) => {
    e.preventDefault();
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

  return (
    <div className="modal-show">
      <span className="material-symbols-outlined" onClick={handleShow}>
        delete
      </span>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Warning Deleting Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            This will permanently delete this invoice. You will not be able to
            un-do this action.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Invoice
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DeleteInvoiceModal;
