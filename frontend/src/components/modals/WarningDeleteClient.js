import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useClientsContext } from "../../hooks/useClientsContext";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const DeleteClientModal = ({ client }) => {
  const { user } = useAuthContext();
  const { dispatch } = useClientsContext();
  const navigate = useNavigate();

  // for modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!user) {
      return;
    }

    const response = await fetch("/clients/" + client._id, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    const json = await response.json();

    if (response.ok) {
      dispatch({ type: "DELETE_CLIENT", payload: json });
      navigate(`/clients`);
    }
  };

  return (
    <div className="modal-show">
      <span className="material-symbols-outlined" onClick={handleShow}>
        delete
      </span>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Warning Deleting Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            This will permanently delete this user and all of their data. You
            will not be able to un-do this action.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DeleteClientModal;
