import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";

import Settings from "./SettingsOffcanvas";
import ToastMessage from "./Toast";

const NavigationBar = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const [showToast, setShowToast] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleShowToast = () => {
    setShowToast(true);
  };
  const handleToastClose = () => {
    setShowToast(false);
  };

  return (
    <header>
      <div className="container">
        <Link to="/">
          <div className="logo">
            <h2>Green2You</h2>
          </div>
        </Link>
        <nav>
          <div className="nav-left-controls">
            {user && user.role === "admin" && (
              <>
                <Link to="/invoices">Invoices</Link>
                <Link to="/clients">Clients</Link>
                <Link to="/statements">Statements</Link>
                <Link to="/emails">Emails</Link>
                <Link to="/payments">Payments</Link>
              </>
            )}
            {user && user.role === "client" && (
              <>
                <Link to="/invoices">Profile</Link>
              </>
            )}
            {/* {user && (
              <>
                <Link to="/invoices">Referral</Link>
                <Link to="/invoices">About us</Link>
              </>
            )} */}
          </div>

          <div className="nav-right-controls">
            {user ? (
              <>
                <span>{user.email}</span>
                <Settings onShowToast={handleShowToast} />
                <button onClick={handleLogout}>Log Out</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
              </>
            )}
          </div>
        </nav>
      </div>
      {showToast && (
        <ToastMessage
          duration={3000}
          text={"Password was Reset!"}
          onClose={handleToastClose}
        />
      )}
    </header>
  );
};

export default NavigationBar;
