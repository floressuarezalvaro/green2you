import { useEffect } from "react";
import { useClientsContext } from "../hooks/useClientsContext.js";
import { useAuthContext } from "../hooks/useAuthContext";

// components below
import ClientDetails from "../components/ClientDetails";
import ClientForm from "../components/forms/ClientForm.js";

// actual page
const Client = () => {
  const { clients, dispatch } = useClientsContext();
  const { user, logout } = useAuthContext();

  useEffect(() => {
    if (!user) return;

    const fetchClients = async () => {
      try {
        const response = await fetch("/clients", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            logout();
          }
          return;
        }

        const json = await response.json();
        dispatch({ type: "SET_CLIENTS", payload: json });
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      }
    };

    if (user) {
      fetchClients();
    }
  }, [dispatch, user, logout]);

  return (
    <div className="home">
      <div className="invoices">
        <h3>Clients Page</h3>
        {clients &&
          clients.map((client) => (
            <ClientDetails key={client._id} client={client} />
          ))}
      </div>
      <ClientForm />
    </div>
  );
};

export default Client;
