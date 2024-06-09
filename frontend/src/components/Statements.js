import { useEffect } from "react";
// import Accordion from "react-bootstrap/Accordion";

import PrintStatement from "../utils/PrintStatement";
import { useStatementsContext } from "../hooks/useStatementsContext";
import { useAuthContext } from "../hooks/useAuthContext";

// const getMonths = () => [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ];

// const getYears = () => [2024, 2025];

const StatementsList = ({ client }) => {
  const { statements, dispatch } = useStatementsContext();
  const { user, logout } = useAuthContext();

  // const months = getMonths();
  // const years = getYears();

  const handleClick = async (e, id) => {
    e.preventDefault();
    PrintStatement(user, id);
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

  return (
    // <Accordion>
    //   {years.map((year) => (
    //     <Accordion.Item eventKey={`eventKey-${year}`} key={year}>
    //       <Accordion.Header>{year}</Accordion.Header>

    //       {months.map((month) => (
    //         <Accordion.Body onClick={handleClick} key={month}>
    //           {month}
    //         </Accordion.Body>
    //       ))}
    //     </Accordion.Item>
    //   ))}
    // </Accordion>

    <div className="home">
      <div className="invoices">
        {statements &&
          statements.map((statement) => (
            <div key={statement._id}>
              <p onClick={(e) => handleClick(e, statement._id)}>
                <strong>Statement ID</strong> {statement._id}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default StatementsList;
