import { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useResetPassword } from "../hooks/useResetPassword";
import ToastMessage from "../components/Toast.js";

const Settings = () => {
  const { user, logout } = useAuthContext();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const { resetPassword } = useResetPassword();

  if (!user) {
    logout();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await resetPassword(user.email, oldPassword, newPassword);
      setShowToast(true);
      setSubmitError(null);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setSubmitError(err.message);
      setShowToast(false);
    }
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  return (
    <div className="profile">
      {showToast && (
        <ToastMessage
          duration={3000}
          text={"Password was reset!"}
          onClose={handleToastClose}
        />
      )}
      <h3>Settings Page</h3>
      <form onSubmit={handleSubmit}>
        <h4>Reset Password</h4>

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
  );
};

export default Settings;
