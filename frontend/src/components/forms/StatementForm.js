import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useStatementsContext } from "../../hooks/useStatementsContext";
import { useClientsContext } from "../../hooks/useClientsContext";

const StatementForm = () => {
  const { user, logout } = useAuthContext();
  const { dispatch } = useStatementsContext();
  const { clients } = useClientsContext();

  const [clientId, setClientId] = useState("");
  const [issuedStartDate, setIssuedStartDate] = useState("");
  const [issuedEndDate, setIssuedEndDate] = useState("");
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Login required");
      return;
    }

    const statement = {
      clientId,
      issuedStartDate,
      issuedEndDate,
    };

    console.log(statement);

    try {
      const response = await fetch("/statements", {
        method: "POST",
        body: JSON.stringify(statement),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      const json = await response.json();
      console.log(json);

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        setError(json.error);
        setEmptyFields(json.emptyFields || []);
        console.log(json.emptyFields);
      }
      if (response.ok) {
        setClientId("");
        setIssuedStartDate("");
        setIssuedEndDate("");
        setError(null);
        setEmptyFields([]);
        dispatch({ type: "CREATE_STATEMENT", payload: json });
      }
    } catch (err) {
      console.error("Failed to create statement", err);
    }
  };

  return (
    <form className="create" onSubmit={handleSubmit}>
      <h3>Manual Statement Add</h3>

      <label htmlFor="clientIdField"> Statement for Client</label>
      <select
        name="clientIdField"
        id="clientIdField"
        onChange={(e) => {
          setClientId(e.target.value);
        }}
        value={clientId}
        className={emptyFields.includes("clientName") ? "error" : ""}
      >
        <option value="">Select a client</option>
        {clients &&
          clients.map((client) => (
            <option key={client._id} value={client._id}>
              {client.clientName}
            </option>
          ))}
      </select>

      <label htmlFor="issueStartDateField">Issue Start Date</label>
      <input
        type="date"
        onChange={(e) => setIssuedStartDate(e.target.value)}
        value={issuedStartDate}
        className={emptyFields.includes("issueStartDate") ? "error" : ""}
        id="issueStartDateField"
      />

      <label htmlFor="issueEndDateField">Issue End Date</label>
      <input
        type="date"
        onChange={(e) => setIssuedEndDate(e.target.value)}
        value={issuedEndDate}
        className={emptyFields.includes("issueEndDate") ? "error" : ""}
        id="issueEndDateField"
      />

      <button>Create New Statement</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default StatementForm;
