import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext.js";
import { useStatementsContext } from "../hooks/useStatementsContext.js";

import StatementForm from "../components/forms/StatementForm.js";
import StatementDetails from "../components/StatementDetails.js";
import Pagination from "../components/Pagination.js";
import ToastMessage from "../components/Toast.js";

const Statement = () => {
  const { user, logout } = useAuthContext();
  const { statements, dispatch } = useStatementsContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [view, setView] = useState("unpaid");
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
        const response = await fetch("/statements", {
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

  if (!statements) {
    return <div>Loading...</div>;
  }

  const handleChangeView = (newView) => {
    setView(newView);
    setCurrentPage(1);
  };

  const filteredStatements = statements.filter((statement) =>
    view === "unpaid" ? !statement.isPaid : statement.isPaid
  );

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

        {currentItems.length > 0 ? (
          currentItems.map((statement) => (
            <StatementDetails
              key={statement._id}
              statement={statement}
              handleShowToast={handleShowToast}
            />
          ))
        ) : (
          <p>No {view} statements</p>
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
        <StatementForm />
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
