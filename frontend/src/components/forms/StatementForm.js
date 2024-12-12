import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useStatementsContext } from "../../hooks/useStatementsContext";
import { useClientsContext } from "../../hooks/useClientsContext";

import ClientSelect from "../ClientSelect";

const StatementForm = ({ handleChangeView }) => {
  const { user, logout } = useAuthContext();
  const { dispatch } = useStatementsContext();
  const { clients } = useClientsContext();

  const [clientId, setClientId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [issuedStartDate, setIssuedStartDate] = useState("");
  const [issuedEndDate, setIssuedEndDate] = useState("");
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      logout();
    }

    const statement = {
      clientId,
      issuedStartDate,
      issuedEndDate,
      creationMethod: "manual",
    };

    try {
      const response = await fetch("/api/statements", {
        method: "POST",
        body: JSON.stringify(statement),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      const json = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        setError(json.error);
        setEmptyFields(json.emptyFields || []);
      }
      if (response.ok) {
        setClientId("");
        setSearchQuery("");
        setIssuedStartDate("");
        setIssuedEndDate("");
        setError(null);
        setEmptyFields([]);
        dispatch({ type: "CREATE_STATEMENT", payload: json });
        handleChangeView("unpaid");
      }
    } catch (err) {
      console.error("Failed to create statement", err);
    }
  };

  return (
    <form className="create" onSubmit={handleSubmit}>
      <h3>Manual Statement Add</h3>

      <ClientSelect
        clients={clients}
        clientId={clientId}
        setClientId={setClientId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        emptyFields={emptyFields}
      />

      <label htmlFor="issueStartDateField">Issue Start Date</label>
      <input
        type="date"
        onChange={(e) => setIssuedStartDate(e.target.value)}
        value={issuedStartDate}
        className={emptyFields.includes("issuedStartDate") ? "error" : ""}
        id="issueStartDateField"
      />

      <label htmlFor="issueEndDateField">Issue End Date</label>
      <input
        type="date"
        onChange={(e) => setIssuedEndDate(e.target.value)}
        value={issuedEndDate}
        className={emptyFields.includes("issuedEndDate") ? "error" : ""}
        id="issueEndDateField"
      />

      <button>Create New Statement</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default StatementForm;
