import { useState } from "react";

const TokenToEmail = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/users/forgotpassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await response.json();

    if (!response.ok) {
      console.log(json.error);
    }
  };

  return (
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
    </form>
  );
};

export default TokenToEmail;
