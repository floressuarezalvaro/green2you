import Accordion from "react-bootstrap/Accordion";

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

const getYears = () => [2024, 2025];

const StatementsList = () => {
  const months = getMonths();
  const years = getYears();

  const handleClick = () => {
    console.log("clicked");
  };

  return (
    <Accordion>
      {years.map((year) => (
        <Accordion.Item eventKey={`eventKey-${year}`} key={year}>
          <Accordion.Header>{year}</Accordion.Header>

          {months.map((month) => (
            <Accordion.Body onClick={handleClick} key={month}>
              {month}
            </Accordion.Body>
          ))}
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

export default StatementsList;