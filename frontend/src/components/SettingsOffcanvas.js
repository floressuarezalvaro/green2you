import { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useResetPassword } from "../hooks/useResetPassword";
import Offcanvas from "react-bootstrap/Offcanvas";

function Settings({ onShowToast }) {
  const { user, logout } = useAuthContext();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const { resetPassword } = useResetPassword();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  if (!user) {
    logout();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await resetPassword(user.email, oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setSubmitError(null);
      handleClose();
      onShowToast();
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  return (
    <>
      <button className="material-symbols-outlined" onClick={handleShow}>
        manage_accounts
      </button>

      <Offcanvas show={show} onHide={handleClose} placement="end">
        <div className="offcanvas-wrapper">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              <h3>Settings</h3>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div>
              <form className="offcanvasPassword" onSubmit={handleSubmit}>
                <h5>Reset Password</h5>

                <div className="input-box">
                  <input
                    type="password"
                    autoComplete="on"
                    onChange={(e) => setOldPassword(e.target.value)}
                    value={oldPassword}
                    id="setOldPassword"
                    placeholder="Old Password"
                  />
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div className="input-box">
                  <input
                    type="password"
                    autoComplete="on"
                    onChange={(e) => setNewPassword(e.target.value)}
                    value={newPassword}
                    id="setNewPassword"
                    placeholder="New Password"
                  />
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <button>Reset Password</button>
                {submitError && <div className="error">{submitError}</div>}
              </form>
            </div>
          </Offcanvas.Body>
        </div>
      </Offcanvas>
    </>
  );
}

export default Settings;
