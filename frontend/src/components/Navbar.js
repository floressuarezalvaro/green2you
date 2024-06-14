import { Link } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";

const NavigationBar = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext();

  const handleClick = () => {
    logout();
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
            {user && (
              <>
                <Link to="/invoices">Invoices Page</Link>
                <Link to="/clients">Clients Page</Link>
              </>
            )}
          </div>

          <div className="nav-right-controls">
            {user ? (
              <>
                <span>{user.email}</span>
                <button onClick={handleClick}>Log Out</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Signup</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default NavigationBar;
