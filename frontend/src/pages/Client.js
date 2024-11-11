import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useClientsContext } from "../hooks/useClientsContext.js";

import ClientDetails from "../components/ClientDetails";
import ClientForm from "../components/forms/ClientForm.js";
import Pagination from "../components/Pagination.js";
import ClientSearch from "../components/forms/ClientSearch";
import ToastMessage from "../components/Toast.js";

const Client = () => {
  const { user, logout } = useAuthContext();
  const { clients, dispatch } = useClientsContext();

  const [showToast, setShowToast] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;

  useEffect(() => {
    if (!user) {
      logout();
    }

    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients", {
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

    fetchClients();
  }, [user, dispatch, logout]);

  if (!clients) {
    return <div>Loading...</div>;
  }

  const filteredClients = clients.filter((client) =>
    client.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShowToast = () => {
    setShowToast(true);
  };
  const handleToastClose = () => {
    setShowToast(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-separation">
      <div className="clients">
        <h3>Clients Page</h3>
        <ClientSearch setClientName={setSearchTerm} />
        {clients.length > 0 ? (
          currentItems.map((client) => (
            <ClientDetails
              key={client._id}
              client={client}
              handleShowToast={handleShowToast}
            />
          ))
        ) : (
          <p className="no-statements">No Clients Yet</p>
        )}

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
      {showToast && (
        <ToastMessage
          duration={6000}
          text={"Invite email was sent to client!"}
          onClose={handleToastClose}
        />
      )}
    </div>
  );
};

export default Client;
