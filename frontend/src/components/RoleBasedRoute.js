import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const RoleBasedRoute = ({ role, children }) => {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.role === role ? children : <Navigate to="/" />;
};

export default RoleBasedRoute;
