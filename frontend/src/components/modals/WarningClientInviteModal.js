import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const WarningClientInviteModal = ({ selectedClient, handleShowToast }) => {
  const { user, logout } = useAuthContext();

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!user || !selectedClient) {
      logout();
    }

    const inviteDetails = {
      clientId: selectedClient._id,
      email: selectedClient.clientEmail,
    };

    try {
      const response = await fetch("/api/users/signup-client", {
        method: "POST",
        body: JSON.stringify(inviteDetails),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      const json = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        console.error(json.error);
      }
      if (response.ok) {
        handleClose();
        handleShowToast();
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (err) {
      console.error("Failed to send invite");
    }
  };

  return (
    <div className="statement-modal-show">
      <Button variant="primary" onClick={handleShow}>
        Invite
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Invite Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            This will send {selectedClient.clientName} an invite to{" "}
            {selectedClient.clientEmail}.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSend}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WarningClientInviteModal;
