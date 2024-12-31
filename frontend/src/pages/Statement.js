import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext.js";
import { useStatementsContext } from "../hooks/useStatementsContext.js";
import { useClientsContext } from "../hooks/useClientsContext.js";

import StatementForm from "../components/forms/StatementForm.js";
import StatementDetails from "../components/StatementDetails.js";
import Pagination from "../components/Pagination.js";
import ToastMessage from "../components/Toast.js";
import ClientSearch from "../components/forms/ClientSearch.js";

const Statement = () => {
  const { user, logout } = useAuthContext();
  const { statements, dispatch } = useStatementsContext();
  const { clients } = useClientsContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [view, setView] = useState("unpaid");
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;

  const handleShowToast = () => {
    setShowToast(true);
  };
  const handleToastClose = () => {
    setShowToast(false);
  };

  useEffect(() => {
    const fetchStatements = async () => {
      if (!user) return;

      try {
        const response = await fetch("/api/statements", {
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
        dispatch({ type: "SET_STATEMENTS", payload: json });
      } catch (error) {
        console.error("Failed to fetch statements:", error);
      }
    };

    fetchStatements();
  }, [user, dispatch, logout]);

  if (!statements || !clients) {
    return <div>Loading...</div>;
  }

  const handleChangeView = (newView) => {
    setView(newView);
    setCurrentPage(1);
  };

  const filteredStatements = statements.filter((statement) => {
    const client = clients.find((client) => client._id === statement.clientId);
    const matchesView =
      view === "unpaid" ? !statement.isPaid : statement.isPaid;
    const matchesSearch =
      !searchTerm ||
      (client?.clientName &&
        client.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesView && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStatements.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-separation">
      <div className="invoices">
        <h3>
          Statements Page - {view.charAt(0).toUpperCase() + view.slice(1)}
        </h3>

        <div className="statements-navbar">
          <button onClick={() => handleChangeView("unpaid")}>
            Unpaid Statements
          </button>
          <button onClick={() => handleChangeView("paid")}>
            Paid Statements
          </button>
        </div>

        <ClientSearch setClientName={setSearchTerm} />

        {currentItems.length > 0 ? (
          currentItems.map((statement) => {
            const client = clients.find(
              (client) => client._id === statement.clientId
            );
            return (
              <StatementDetails
                key={statement._id}
                statement={statement}
                user={user}
                client={client}
                handleShowToast={handleShowToast}
              />
            );
          })
        ) : (
          <p className="no-statements">
            No {view} statements match your search
          </p>
        )}
        {filteredStatements.length > itemsPerPage && (
          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={filteredStatements.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        )}
      </div>
      <div className="form-container">
        <StatementForm handleChangeView={handleChangeView} />
      </div>
      {showToast && (
        <ToastMessage
          duration={3000}
          text={"Email was sent!"}
          onClose={handleToastClose}
        />
      )}
    </div>
  );
};

export default Statement;
