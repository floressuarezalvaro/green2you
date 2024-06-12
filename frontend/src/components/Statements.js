import { useEffect } from "react";
import Accordion from "react-bootstrap/Accordion";

import PrintStatement from "../utils/PrintStatement";
import { useStatementsContext } from "../hooks/useStatementsContext";
import { useAuthContext } from "../hooks/useAuthContext";

const getMonths = () => [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getYears = (statements) => {
  const years = new Set(
    statements.map((statement) =>
      new Date(statement.issuedEndDate).getFullYear()
    )
  );
  return Array.from(years).sort((a, b) => a - b);
};

const StatementsList = ({ client }) => {
  const { statements, dispatch } = useStatementsContext();
  const { user, logout } = useAuthContext();

  const handleClick = async (e, id) => {
    e.preventDefault();
    PrintStatement(user, id);
  };

  const formatIssuedDate = (dateStr) => {
    const date = new Date(dateStr);
    const monthOptions = { month: "long" };
    const yearOptions = { year: "numeric" };
    const month = date.toLocaleDateString(undefined, monthOptions);
    const year = date.toLocaleDateString(undefined, yearOptions);
    return { month, year };
  };

  useEffect(() => {
    if (!user) return;

    const fetchStatements = async () => {
      try {
        const response = await fetch(`/statements/client/${client}`, {
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
        console.error("Failed to fetch Statements:", error);
      }
    };

    if (user) {
      fetchStatements();
    }
  }, [dispatch, user, client, logout]);

  const groupedStatements = (statements) => {
    return statements.reduce((acc, statement) => {
      const { month, year } = formatIssuedDate(statement.issuedEndDate);
      if (!acc[year]) {
        acc[year] = {};
      }
      if (!acc[year][month]) {
        acc[year][month] = [];
      }
      acc[year][month].push(statement);
      return acc;
    }, {});
  };

  const statementGroups = statements ? groupedStatements(statements) : {};
  const years = statements ? getYears(statements) : [];
  const months = getMonths();

  return (
    <div className="accordion">
      <Accordion>
        {years.length === 0 ? (
          <p>You have no statements yet.</p>
        ) : (
          years.map((year) => (
            <Accordion.Item eventKey={`eventKey-${year}`} key={year}>
              <Accordion.Header>{year}</Accordion.Header>

              {months.map((month) => (
                <Accordion.Body key={month}>
                  <h4>{month}</h4>
                  {statementGroups[year] && statementGroups[year][month] ? (
                    statementGroups[year][month].map((statement) => (
                      <div key={statement._id}>
                        <p>
                          Day: {new Date(statement.issuedEndDate).getDate()}
                          <span
                            onClick={(e) => handleClick(e, statement._id)}
                            className="material-symbols-outlined"
                          >
                            open_in_new
                          </span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>You have no statements available for this period.</p>
                  )}
                </Accordion.Body>
              ))}
            </Accordion.Item>
          ))
        )}
      </Accordion>
    </div>
  );
};

export default StatementsList;
