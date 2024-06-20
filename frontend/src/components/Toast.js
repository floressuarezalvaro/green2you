import Toast from "react-bootstrap/Toast";
import { useEffect } from "react";

const PasswordResetToast = ({ duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/login";
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <Toast>
      <Toast.Header>
        <strong className="me-auto">Success</strong>
      </Toast.Header>
      <Toast.Body>
        Your password was reset. Please sign in again! We will redirect you
        shortly!
      </Toast.Body>
    </Toast>
  );
};

export default PasswordResetToast;
