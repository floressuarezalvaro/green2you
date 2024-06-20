import Toast from "react-bootstrap/Toast";
import { useEffect } from "react";
import ToastContainer from "react-bootstrap/ToastContainer";

const PasswordResetToast = ({ duration, text }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/login";
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <ToastContainer position="top-end" className="p-3">
      <Toast>
        <Toast.Header>
          <strong className="me-auto">Success</strong>
        </Toast.Header>
        <Toast.Body>
          <p>{text}</p>
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default PasswordResetToast;
