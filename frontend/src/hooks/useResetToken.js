import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useResetToken = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const navigate = useNavigate();

  const resetToken = async (password, token) => {
    setIsLoading(true);
    setError(null);

    const response = await fetch(`/users/resetpassword/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const json = await response.json();

    if (!response.ok) {
      setIsLoading(false);
      setError(json.error);
    }
    if (response.ok) {
      setIsLoading(false);
      navigate(`/login`);
    }
  };
  return { resetToken, isLoading, error };
};
