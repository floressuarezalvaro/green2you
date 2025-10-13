import React, { useState, useEffect, useRef } from "react";

const ClientSelect = ({
  clients,
  setClientId,
  emptyFields,
  searchQuery,
  setSearchQuery,
}) => {
  const [filteredClients, setFilteredClients] = useState(clients);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setFilteredClients(
      clients.filter((client) =>
        client.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, clients]);

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleClientSelect = (clientId) => {
    setClientId(clientId);
    setIsDropdownOpen(false);
    const selectedClient = clients.find((client) => client._id === clientId);
    if (selectedClient) {
      setSearchQuery(selectedClient.clientName);
    }
  };

  const handleOutsideClick = (event) => {
    if (inputRef.current && !inputRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div className="client-select" ref={inputRef}>
      <label htmlFor="clientIdField">Select Client</label>
      <input
        type="text"
        id="clientIdField"
        placeholder="Search clients"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={handleInputFocus}
        className={emptyFields.includes("clientName") ? "error" : ""}
        autoComplete="off"
      />
      {isDropdownOpen && (
        <ul className="dropdown">
          {filteredClients.map((client) => (
            <li
              key={client._id}
              onClick={() => handleClientSelect(client._id)}
              className="dropdown-item"
            >
              {client.clientName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClientSelect;
