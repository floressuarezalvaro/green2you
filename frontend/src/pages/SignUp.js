import { useState } from "react";
import { useSignUp } from "../hooks/useSignUp";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signUp, error, isLoading } = useSignUp();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await signUp(email, password);
  };

  return (
    <form className="signup" onSubmit={handleSubmit}>
      <h3>Sign Up</h3>

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

      <button disabled={isLoading}>Register</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default SignUp;
