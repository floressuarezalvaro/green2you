import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useStatementsContext } from "../../hooks/useStatementsContext";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const DeleteStatementModal = ({ statement }) => {
  const { user, logout } = useAuthContext();
  const { dispatch } = useStatementsContext();

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!user) {
      logout();
    }

    const response = await fetch("/api/statements/" + statement._id, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    const json = await response.json();

    if (response.ok) {
      dispatch({ type: "DELETE_STATEMENT", payload: json });
    }
  };

  return (
    <div className="modal-show">
      <span className="material-symbols-outlined" onClick={handleShow}>
        delete
      </span>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Warning Deleting Statement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            This will permanently delete this statement. You will not be able to
            un-do this action.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Statement
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DeleteStatementModal;
