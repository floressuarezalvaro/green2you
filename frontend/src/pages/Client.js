import { useEffect } from "react";
import { useClientsContext } from "../hooks/useClientsContext.js";
import { useAuthContext } from "../hooks/useAuthContext";

// components below
import ClientDetails from "../components/ClientDetails";
import ClientForm from "../components/forms/ClientForm.js";

// actual page
const Client = () => {
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
      }
    };

    if (user) {
      fetchClients();
    }
  }, [dispatch, user]);

  return (
    <div className="home">
      <div className="clients">
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
