import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useClientsContext } from "../../hooks/useClientsContext";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const EmailStatementModal = ({ statement, handleShowToast }) => {
  const { user, logout } = useAuthContext();
  const { clients = [] } = useClientsContext();

  // for modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [clientEmail, setClientEmail] = useState("");

  useEffect(() => {
    const client = clients.find((client) => client._id === statement.clientId);
    if (client) {
      setClientEmail(client.clientEmail);
    }
  }, [clients, statement.clientId]);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!user || !clientEmail) {
      return;
    }

    const emailDetails = {
      clientEmail,
      statementId: statement._id,
    };

    try {
      const response = await fetch("/emails/manual-statement-email", {
        method: "POST",
        body: JSON.stringify(emailDetails),
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
      }
    } catch (err) {
      console.error("Failed to send email");
    }
  };

  return (
    <div className="statement-modal-show">
      <button className="material-symbols-outlined" onClick={handleShow}>
        outgoing_mail
      </button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Send Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            This will send the statement to the client's email address:{" "}
            {clientEmail}
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

export default EmailStatementModal;
