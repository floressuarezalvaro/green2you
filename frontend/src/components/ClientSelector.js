import { useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useClientsContext } from "../hooks/useClientsContext";

const [clientId, setClientId] = useState("");

const ClientSelector = ({ clients, clientId, setClientId }) => (
  <form className="create">
    <label htmlFor="clientIdField">Select Client:</label>
    <select
      name="clientIdField"
      id="clientIdField"
      onChange={(e) => setClientId(e.target.value)}
      value={clientId}
    >
      <option value="">Select From List</option>
      {clients.map((client) => (
        <option key={client._id} value={client._id}>
          {client.clientName}
        </option>
      ))}
    </select>
  </form>
);
