import { useEffect, useState } from "react";
import { useClientsContext } from "../hooks/useClientsContext.js";
import { useAuthContext } from "../hooks/useAuthContext";

// components below
import ClientDetails from "../components/ClientDetails";
import ClientForm from "../components/forms/ClientForm.js";
import Pagination from "../components/Pagination.js";
import ClientSearch from "../components/forms/ClientSearch";

// actual page
const Client = () => {
  const { clients, dispatch } = useClientsContext();
  const { user, logout } = useAuthContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;

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

  if (!clients) {
    return <div>Loading...</div>;
  }

  // Filter clients based on the search term
  const filteredClients = clients.filter((client) =>
    client.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-separation">
      <div className="clients">
        <h3>Clients Page</h3>
        <ClientSearch setClientName={setSearchTerm} />
        {currentItems &&
          currentItems.map((client) => (
            <ClientDetails key={client._id} client={client} />
          ))}
        {filteredClients.length > itemsPerPage && (
          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={filteredClients.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        )}
      </div>
      <div className="form-container">
        <ClientForm />
      </div>
    </div>
  );
};

export default Client;
