import { useEffect, useState } from "react";
import { useInvoicesContext } from "../hooks/useInvoicesContext";
import { useClientsContext } from "../hooks/useClientsContext";
import { useAuthContext } from "../hooks/useAuthContext";

const Profile = () => {
  const { dispatch } = useInvoicesContext();
  const { clients } = useClientsContext();
  const { user } = useAuthContext();

  const [clientId, setClientId] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user || !clientId) return;
      console.log(clientId);
      try {
        const response = await fetch(`/invoices?clientId=${clientId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Handle unauthorized
          }
          return;
        }

        const json = await response.json();
        dispatch({ type: "SET_INVOICES", payload: json });
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      }
    };

    fetchInvoices();
  }, [dispatch, user, clientId]);

  return (
    <form className="create">
      <label htmlFor="clientIdField"> Select Client: </label>
      <select
        name="clientIdField"
        id="clientIdField"
        onChange={(e) => {
          setClientId(e.target.value);
        }}
        value={clientId}
      >
        <option value="">Select From List</option>
        {clients &&
          clients.map((client) => (
            <option key={client._id} value={client._id}>
              {client.clientName}
            </option>
          ))}
      </select>
    </form>
  );
};

export default Profile;
