import { useState } from "react";
import { useClientsContext } from "../../hooks/useClientsContext";
import { useAuthContext } from "../../hooks/useAuthContext";

const ClientForm = () => {
  const { dispatch } = useClientsContext();
  const { user, logout } = useAuthContext();

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhoneNumber, setClientPhoneNumber] = useState("");
  const [clientStreetLineOne, setClientStreetLineOne] = useState("");
  const [clientStreetLineTwo, setClientStreetLineTwo] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientState, setClientState] = useState("");
  const [clientZip, setClientZip] = useState("");
  const [clientCycleDate, setClientCycleDate] = useState("");
  const [clientWelcomeEmailEnabled, setClientWelcomeEmailEnabled] =
    useState(false);
  const [clientAutoStatementsEnabled, setClientAutoStatementsEnabled] =
    useState(false);
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Login required");
      return;
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
      clientWelcomeEmailEnabled,
      clientAutoStatementsEnabled,
    };

    try {
      const response = await fetch("/clients", {
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
        setClientWelcomeEmailEnabled(false);
        setClientAutoStatementsEnabled(false);
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
        id="clientStreetLineOneField"
      />

      <label htmlFor="clientStreetLineTwoField">Address 2</label>
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
        id="clientCityField"
      />

      <label htmlFor="clientStateField">State</label>
      <input
        type="text"
        onChange={(e) => setClientState(e.target.value)}
        value={clientState}
        id="clientStateField"
      />

      <label htmlFor="clientZipField">Zip Code</label>
      <input
        type="number"
        onChange={(e) => setClientZip(e.target.value)}
        value={clientZip}
        id="clientZipField"
      />

      <label htmlFor="clientCycleDateField">Cycle Date</label>
      <input
        type="number"
        onChange={(e) => setClientCycleDate(e.target.value)}
        value={clientCycleDate}
        id="clientCycleDateField"
        className={emptyFields.includes("clientCycleDate") ? "error" : ""}
      />

      <div className="toggle-switch-container">
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
      </div>

      <div className="toggle-switch-container">
        <label htmlFor="clientAutoStatementsEnabledField">
          Automatic Statements
        </label>

        <div className="toggle-switch">
          <input
            type="checkbox"
            className="toggle-switch-checkbox"
            onChange={(e) => setClientAutoStatementsEnabled(e.target.checked)}
            value={clientAutoStatementsEnabled}
            id="clientAutoStatementsEnabledField"
          />
          <label
            className="toggle-switch-label"
            htmlFor="clientAutoStatementsEnabledField"
          >
            <span className="toggle-switch-inner"></span>
            <span className="toggle-switch-switch"></span>
          </label>
        </div>
      </div>

      <button>Create New Client</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default ClientForm;
