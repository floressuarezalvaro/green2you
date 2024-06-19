import { useState } from "react";
import { useResetToken } from "../hooks/useResetToken";

const ForgotResetPassword = () => {
  const [password, setPassword] = useState("");
  const { resetToken, error, isLoading } = useResetToken();

  const token = window.location.pathname.split("/")[2];

  const handleSubmit = async (e) => {
    e.preventDefault();
    await resetToken(password, token);
  };

  return (
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
      <button disabled={isLoading}>Login</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default ForgotResetPassword;
