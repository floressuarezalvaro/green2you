import { useEffect } from "react";
import { useClientsContext } from "../hooks/useClientsContext.js";
import { useAuthContext } from "../hooks/useAuthContext";

// components below
import ClientDetails from "../components/ClientDetails";

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
      console.log("fetched clients");
    }
  }, [dispatch, user]);

  return (
    <div className="client-home">
      <div className="clients">
        {clients &&
          clients.map((clients) => (
            <ClientDetails key={clients._id} clients={clients} />
          ))}
      </div>
      {/* <ClientsForm /> */}
    </div>
  );
};

export default Client;
