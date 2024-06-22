import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext.js";
import { useStatementsContext } from "../hooks/useStatementsContext.js";

// components
import StatementForm from "../components/forms/StatementForm.js";
import StatementDetails from "../components/StatementDetails.js";
import Pagination from "../components/Pagination.js";

const Statement = () => {
  const { user, logout } = useAuthContext();
  const { statements, dispatch } = useStatementsContext();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
          }
          return;
        }

        const json = await response.json();
        dispatch({ type: "SET_STATEMENTS", payload: json });
      } catch (error) {
        console.error("Failed to fetch statements:", error);
      }
    };

    if (user) {
      fetchStatements();
    }
  }, [dispatch, user, logout]);

  if (!statements) {
    return <div>Loading...</div>;
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = statements.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-separation">
      <div className="invoices">
        <h3>Statements Page</h3>
        {currentItems &&
          currentItems.map((statement) => (
            <StatementDetails key={statement._id} statement={statement} />
          ))}
        {statements.length > itemsPerPage && (
          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={statements.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        )}
      </div>
      <div className="form-container">{<StatementForm />}</div>
    </div>
  );
};

export default Statement;
