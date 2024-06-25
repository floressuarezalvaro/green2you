import React from "react";

const ClientSelect = ({ clients, clientId, setClientId, emptyFields }) => {
  return (
    <div>
      <label htmlFor="clientIdField"> Select Client</label>
      <select
        name="clientIdField"
        id="clientIdField"
        onChange={(e) => {
          setClientId(e.target.value);
        }}
        value={clientId}
        className={emptyFields.includes("clientName") ? "error" : ""}
      >
        <option value=""></option>
        {clients &&
          clients.map((client) => (
            <option key={client._id} value={client._id}>
              {client.clientName}
            </option>
          ))}
      </select>
    </div>
  );
};

export default ClientSelect;
