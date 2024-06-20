import { useState } from "react";

export const useResetToken = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetToken = async (password, token) => {
    setIsLoading(true);
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

      setIsLoading(false);
      return json;
    } catch (error) {
      setIsLoading(false);
      setError(error.message);
      throw error;
    }
  };

  return { resetToken, isLoading, error };
};
