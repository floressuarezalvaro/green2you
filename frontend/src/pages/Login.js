import { useState } from "react";
import { useLogin } from "../hooks/useLogin";

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, isLoading } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await login(email, password);
  };

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h3>Login</h3>
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
      <div className="forgot-register">
        <a href="/forgotpassword">Forgot password?</a>
      </div>
      <button disabled={isLoading}>Login</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default LogIn;
