import { useState } from "react";

export const useResetToken = () => {
  const [error, setError] = useState(null);

  const resetToken = async (password, token) => {
    setError(null);

    try {
      const response = await fetch(`/users/resetpassword/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error);
      }

      return json;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return { resetToken, error };
};
