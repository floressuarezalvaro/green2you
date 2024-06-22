import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const EmailStatementModal = ({ statement }) => {
  const { user } = useAuthContext();

  // for modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!user) {
      return;
    }
    console.log("Clicked Send Email");
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
          <p>This will send the statement to the client's email address.</p>
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
