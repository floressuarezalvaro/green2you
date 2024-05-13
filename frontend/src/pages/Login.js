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
      <h3>Log In</h3>

      <label>Email: </label>
      <input
        type="email"
        autoComplete="on"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      />

      <label> Password: </label>
      <input
        type="password"
        autoComplete="on"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      <button disabled={isLoading}>Login</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default LogIn;
