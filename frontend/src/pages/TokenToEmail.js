import { useState } from "react";
import ToastRedirect from "../components/Toast";

const TokenToEmail = () => {
  const [email, setEmail] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/users/forgotpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      setShowToast(true);
      setSubmitError(null);
      setEmail("");
    } catch (err) {
      setSubmitError(err.message);
      setShowToast(false);
    }
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  return (
    <div>
      {showToast && (
        <ToastRedirect
          duration={10000}
          text={
            "Email was sent! Use the link sent via email to help reset your password."
          }
          onClose={handleToastClose}
        />
      )}
      <form className="login" onSubmit={handleSubmit}>
        <h3>Email Temporary Password</h3>
        <div className="input-box">
          <input
            type="email"
            autoComplete="on"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            id="userEmail"
            placeholder="Email"
          />
          <span className="material-symbols-outlined">person</span>
        </div>
        <button>Send Email</button>
        {submitError && <div className="error">{submitError}</div>}
      </form>
    </div>
  );
};

export default TokenToEmail;
