import { Link } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
// import NavDropdown from "react-bootstrap/NavDropdown";

const NavigationBar = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext();

  const handleClick = () => {
    logout();
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary" fixed="top">
      <Container>
        <Navbar.Brand>Green2You</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav>
            {user ? (
              <>
                <Nav.Link as={Link} to="/">
                  Invoices
                </Nav.Link>
                <Nav.Link as={Link} to="/clients">
                  Clients
                </Nav.Link>
                <Nav className="ml-auto">
                  <Navbar.Text>{user.email}</Navbar.Text>
                  <Nav.Link onClick={handleClick}>Logout</Nav.Link>
                </Nav>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/signup">
                  Signup
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    // <NavDropdown title="Dropdown" id="basic-nav-dropdown">
    //     <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
    //     <NavDropdown.Item href="#action/3.2">
    //       Another action
    //     </NavDropdown.Item>
    //     <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
    //     <NavDropdown.Divider />
    //     <NavDropdown.Item href="#action/3.4">
    //       Separated link
    //     </NavDropdown.Item>
    //   </NavDropdown>
  );
};

export default NavigationBar;
