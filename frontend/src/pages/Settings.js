import { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useResetPassword } from "../hooks/useResetPassword";

const Settings = () => {
  const { user, logout } = useAuthContext();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const { resetPassword } = useResetPassword();

  if (!user) {
    logout();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await resetPassword(user.email, oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setSubmitError(err.message);
      console.log(err.message);
    }
  };

  return (
    <div className="profile">
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
