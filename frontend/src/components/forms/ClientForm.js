import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useClientsContext } from "../../hooks/useClientsContext";

const ClientForm = () => {
  const { user, logout } = useAuthContext();
  const { dispatch } = useClientsContext();

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhoneNumber, setClientPhoneNumber] = useState("");
  const [clientStreetLineOne, setClientStreetLineOne] = useState("");
  const [clientStreetLineTwo, setClientStreetLineTwo] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientState, setClientState] = useState("");
  const [clientZip, setClientZip] = useState("");
  const [clientCycleDate, setClientCycleDate] = useState("");
  const [clientStatementCreateDate, setClientStatementCreateDate] =
    useState("");
  const [clientPlan, setClientPlan] = useState("");
  const [clientMonthly, setClientMonthly] = useState(false);
  const [
    clientAutoEmailStatementsEnabled,
    setClientAutoEmailStatementsEnabled,
  ] = useState(false);
  const [clientWelcomeEmailEnabled, setClientWelcomeEmailEnabled] =
    useState(false);

  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      logout();
    }

    const client = {
      clientName,
      clientEmail,
      clientPhoneNumber,
      clientStreetLineOne,
      clientStreetLineTwo,
      clientCity,
      clientState,
      clientZip,
      clientCycleDate,
      clientStatementCreateDate,
      clientPlan,
      clientMonthly,
      clientAutoEmailStatementsEnabled,
      clientWelcomeEmailEnabled,
    };

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        body: JSON.stringify(client),
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
        console.log(json.emptyFields);
      }
      if (response.ok) {
        setClientName("");
        setClientEmail("");
        setClientPhoneNumber("");
        setClientStreetLineOne("");
        setClientStreetLineTwo("");
        setClientCity("");
        setClientState("");
        setClientZip("");
        setClientCycleDate("");
        setClientStatementCreateDate("");
        setClientPlan("");
        setClientMonthly(false);
        setClientWelcomeEmailEnabled(false);
        setClientAutoEmailStatementsEnabled(false);
        setError(null);
        setEmptyFields([]);
        dispatch({ type: "CREATE_CLIENT", payload: json });
      }
    } catch (err) {
      console.error("Failed to create client", err);
    }
  };

  return (
    <form className="create" onSubmit={handleSubmit}>
      <h3>Add Client</h3>

      <label htmlFor="clientNameField">Client Name</label>
      <input
        type="text"
        onChange={(e) => setClientName(e.target.value)}
        value={clientName}
        className={emptyFields.includes("clientName") ? "error" : ""}
        id="clientNameField"
      />

      <label htmlFor="clientEmailField">Email</label>
      <input
        type="text"
        onChange={(e) => setClientEmail(e.target.value)}
        value={clientEmail}
        className={emptyFields.includes("clientEmail") ? "error" : ""}
        id="clientEmailField"
      />

      <label htmlFor="clientPhoneNumberField">Phone Number</label>
      <input
        type="number"
        onChange={(e) => setClientPhoneNumber(e.target.value)}
        value={clientPhoneNumber}
        className={emptyFields.includes("clientPhoneNumber") ? "error" : ""}
        id="clientPhoneNumberField"
      />

      <label htmlFor="clientStreetLineOneField">Address 1</label>
      <input
        type="text"
        onChange={(e) => setClientStreetLineOne(e.target.value)}
        value={clientStreetLineOne}
        className={emptyFields.includes("clientStreetLineOne") ? "error" : ""}
        id="clientStreetLineOneField"
      />

      <label htmlFor="clientStreetLineTwoField">Address 2 (Optional)</label>
      <input
        type="text"
        onChange={(e) => setClientStreetLineTwo(e.target.value)}
        value={clientStreetLineTwo}
        id="clientStreetLineTwoField"
      />

      <label htmlFor="clientCityField">City</label>
      <input
        type="text"
        onChange={(e) => setClientCity(e.target.value)}
        value={clientCity}
        className={emptyFields.includes("clientCity") ? "error" : ""}
        id="clientCityField"
      />

      <label htmlFor="clientStateField">State</label>
      <input
        type="text"
        onChange={(e) => setClientState(e.target.value)}
        value={clientState}
        className={emptyFields.includes("clientState") ? "error" : ""}
        id="clientStateField"
      />

      <label htmlFor="clientZipField">Zip Code</label>
      <input
        type="number"
        onChange={(e) => setClientZip(e.target.value)}
        value={clientZip}
        className={emptyFields.includes("clientZip") ? "error" : ""}
        id="clientZipField"
      />

      <label htmlFor="clientCycleDateField">Cycle End Date (1-31)</label>
      <input
        type="number"
        onChange={(e) => setClientCycleDate(e.target.value)}
        value={clientCycleDate}
        className={emptyFields.includes("clientCycleDate") ? "error" : ""}
        id="clientCycleDateField"
      />

      <label htmlFor="clientStatementCreateDateField">
        Statement Create Date (1-31)
      </label>
      <input
        type="number"
        onChange={(e) => setClientStatementCreateDate(e.target.value)}
        value={clientStatementCreateDate}
        className={
          emptyFields.includes("clientStatementCreateDate") ? "error" : ""
        }
        id="clientStatementCreateDateField"
      />

      <label htmlFor="clientPlanField">Client Plan Description</label>
      <input
        type="text"
        onChange={(e) => setClientPlan(e.target.value)}
        value={clientPlan}
        className={emptyFields.includes("clientPlan") ? "error" : ""}
        id="clientPlanField"
      />

      <div className="toggle-switch-container">
        <label htmlFor="clientMonthlyField">Client Monthly</label>

        <div className="toggle-switch">
          <input
            type="checkbox"
            className="toggle-switch-checkbox"
            onChange={(e) => setClientMonthly(e.target.checked)}
            value={clientMonthly}
            id="clientMonthlyField"
          />
          <label className="toggle-switch-label" htmlFor="clientMonthlyField">
            <span className="toggle-switch-inner"></span>
            <span className="toggle-switch-switch"></span>
          </label>
        </div>
      </div>

      <div className="toggle-switch-container">
        <label htmlFor="clientAutoEmailStatementsEnabledField">
          Auto Email Statements
        </label>

        <div className="toggle-switch">
          <input
            type="checkbox"
            className="toggle-switch-checkbox"
            onChange={(e) =>
              setClientAutoEmailStatementsEnabled(e.target.checked)
            }
            value={clientAutoEmailStatementsEnabled}
            id="clientAutoEmailStatementsEnabledField"
          />
          <label
            className="toggle-switch-label"
            htmlFor="clientAutoEmailStatementsEnabledField"
          >
            <span className="toggle-switch-inner"></span>
            <span className="toggle-switch-switch"></span>
          </label>
        </div>
      </div>

      {/* <div className="toggle-switch-container">
        <label htmlFor="clientWelcomeEmailEnabledField">Welcome Email</label>

        <div className="toggle-switch">
          <input
            type="checkbox"
            className="toggle-switch-checkbox"
            onChange={(e) => setClientWelcomeEmailEnabled(e.target.checked)}
            value={clientWelcomeEmailEnabled}
            id="clientWelcomeEmailEnabledField"
          />
          <label
            className="toggle-switch-label"
            htmlFor="clientWelcomeEmailEnabledField"
          >
            <span className="toggle-switch-inner"></span>
            <span className="toggle-switch-switch"></span>
          </label>
        </div>
      </div> */}

      <button>Create New Client</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default ClientForm;
