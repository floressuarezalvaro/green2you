import { useState } from "react";
import { useResetToken } from "../hooks/useResetToken";
import PasswordResetToast from "../components/Toast";

const ForgotResetPassword = () => {
  const [password, setPassword] = useState("");
  const { resetToken } = useResetToken();
  const [showToast, setShowToast] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const token = window.location.pathname.split("/")[2];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetToken(password, token);
      setShowToast(true);
      setSubmitError(null);
      setPassword("");
    } catch (err) {
      setSubmitError(err.message);
      setShowToast(false);
    }
  };

  return (
    <div>
      {showToast && (
        <PasswordResetToast
          duration={5000}
          text={
            "Your password was reset. Please sign in again! We will redirect you shortly!"
          }
        />
      )}
      <form className="login" onSubmit={handleSubmit}>
        <h3>New Password</h3>
        <div className="input-box">
          <input
            type="password"
            autoComplete="on"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            id="userPassword"
            placeholder="Password"
          />
          <span className="material-symbols-outlined">lock</span>
        </div>
        <button>Reset Password</button>
        {submitError && <div className="error">{submitError}</div>}
      </form>
    </div>
  );
};

export default ForgotResetPassword;
