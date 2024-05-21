import React, { useEffect, useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import { useClientsContext } from "../hooks/useClientsContext.js";
import { useAuthContext } from "../hooks/useAuthContext";

const ClientFilter = () => {
  const { clients, dispatch } = useClientsContext();
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchClients = async () => {
      const response = await fetch("/clients", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: "SET_CLIENTS", payload: json });
        console.log(json);
      }
    };

    if (user) {
      fetchClients();
    }
  }, [dispatch, user]);

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <a
      href="/clients"
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {children}
      &#x25bc;
    </a>
  ));

  const CustomMenu = React.forwardRef(
    ({ children, style, className, "aria-labelledby": labeledBy }, ref) => {
      const [value, setValue] = useState("");

      return (
        <div
          ref={ref}
          style={style}
          className={className}
          aria-labelledby={labeledBy}
        >
          <Form.Control
            autoFocus
            className="mx-3 my-2 w-auto"
            placeholder="Type to filter..."
            onChange={(e) => setValue(e.target.value)}
            value={value}
          />
          <ul className="list-unstyled">
            {React.Children.toArray(children).filter(
              (child) =>
                !value || child.props.children.toLowerCase().startsWith(value)
            )}
          </ul>
        </div>
      );
    }
  );

  return (
    <Dropdown>
      <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
        Filter by Client
      </Dropdown.Toggle>

      <Dropdown.Menu as={CustomMenu}>
        {clients &&
          clients.map((client) => (
            <Dropdown.Item key={client.id}>{client.clientName}</Dropdown.Item>
          ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ClientFilter;
