import { useState } from "react";

export const useResetPassword = () => {
  const [error, setError] = useState(null);

  const resetPassword = async (email, oldPassword, newPassword) => {
    setError(null);

    try {
      const response = await fetch(`/users/resetpassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, oldPassword, newPassword }),
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

  return { resetPassword, error };
};
