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
  const [menuOpen, setMenuOpen] = useState(false);

  const profileLink = user ? `/profile/${user.id}` : "";

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const handleShowToast = () => {
    setShowToast(true);
  };
  const handleToastClose = () => {
    setShowToast(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <header>
      <div className="container">
        {user && (
          <div className="hamburger" onClick={toggleMenu}>
            &#9776;
          </div>
        )}

        <div className="logo">
          <Link to="/" onClick={handleLinkClick}>
            <h2>Green2You</h2>
          </Link>
        </div>
        <nav>
          <div
            className={`nav-left-controls nav-links ${
              menuOpen ? "active" : ""
            }`}
          >
            {user && user.role === "admin" && (
              <>
                <Link to="/clients" onClick={handleLinkClick}>
                  Clients
                </Link>
                <Link to="/invoices" onClick={handleLinkClick}>
                  Invoices
                </Link>
                <Link to="/statements" onClick={handleLinkClick}>
                  Statements
                </Link>
                <Link to="/payments" onClick={handleLinkClick}>
                  Payments
                </Link>
                <Link to="/logs" onClick={handleLinkClick}>
                  Logs
                </Link>
              </>
            )}
            {user && user.role === "client" && (
              <>
                <Link to={profileLink} onClick={handleLinkClick}>
                  Profile
                </Link>
              </>
            )}
          </div>

          <div className="nav-right-controls">
            {user && (
              <>
                <span>{user.email}</span>
                <Settings onShowToast={handleShowToast} />
                <button onClick={handleLogout}>Log Out</button>
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
