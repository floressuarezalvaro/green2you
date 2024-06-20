import { useEffect } from "react";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

const ToastRedirect = ({ duration, text }) => {
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

export default ToastRedirect;
