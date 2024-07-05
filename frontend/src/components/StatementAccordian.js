import { useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useStatementsContext } from "../hooks/useStatementsContext";

import Accordion from "react-bootstrap/Accordion";
import PrintStatement from "../utils/PrintStatement";
import moment from "moment-timezone";

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
  const { user, logout } = useAuthContext();
  const { statements, dispatch } = useStatementsContext();

  const handleClick = async (e, id) => {
    e.preventDefault();
    PrintStatement(user, id);
  };

  const formatIssuedDate = (dateStr) => {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString(undefined, { month: "long" });
    const year = date.toLocaleDateString(undefined, { year: "numeric" });
    return { month, year };
  };

  const formatOpeningClosingDate = (startDateStr, endDateStr) => {
    const startDate = moment.tz(startDateStr, "UTC").tz("America/Los_Angeles");
    const endDate = moment.tz(endDateStr, "UTC").tz("America/Los_Angeles");

    const formattedStartDate = startDate.format("MMMM D, YYYY");
    const formattedEndDate = endDate.format("MMMM D, YYYY");
    return `Opening - Closing Date: ${formattedStartDate} - ${formattedEndDate}`;
  };

  useEffect(() => {
    if (!user) {
      logout();
    }

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
    <div className="statements-wrapper">
      <h5>Statements</h5>
      <div className="accordion">
        <Accordion>
          {years.length === 0 ? (
            <p className="profile-no-statements">You have no statements yet.</p>
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
                          <p className="statement">
                            {formatOpeningClosingDate(
                              statement.issuedStartDate,
                              statement.issuedEndDate
                            )}
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
                      <p className="no-statements">
                        You have no statements available for this period.
                      </p>
                    )}
                  </Accordion.Body>
                ))}
              </Accordion.Item>
            ))
          )}
        </Accordion>
      </div>
    </div>
  );
};

export default StatementsList;
