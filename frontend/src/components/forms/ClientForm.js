import { useState } from "react";
import { useClientsContext } from "../../hooks/useClientsContext";
import { useAuthContext } from "../../hooks/useAuthContext";

const ClientForm = () => {
  const { dispatch } = useClientsContext();
  const { user } = useAuthContext();

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhoneNumber, setClientPhoneNumber] = useState("");
  const [clientStreetLineOne, setClientStreetLineOne] = useState("");
  const [clientStreetLineTwo, setClientStreetLineTwo] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientState, setClientState] = useState("");
  const [clientZip, setClientZip] = useState("");
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
    };

    const response = await fetch("/clients", {
      method: "POST",
      body: JSON.stringify(client),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      setError(json.error);
      setEmptyFields(json.emptyFields);
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
      setError(null);
      setEmptyFields([]);
      console.log("New Client Added", json);
      dispatch({ type: "CREATE_CLIENT", payload: json });
    }
  };

  return (
    <form className="create" onSubmit={handleSubmit}>
      <h3>Add a new client</h3>

      <label htmlFor="clientNameField">Client Name: </label>
      <input
        type="text"
        onChange={(e) => setClientName(e.target.value)}
        value={clientName}
        className={emptyFields.includes("clientName") ? "error" : ""}
        id="clientNameField"
      />

      <label htmlFor="clientEmailField">Email: </label>
      <input
        type="text"
        onChange={(e) => setClientEmail(e.target.value)}
        value={clientEmail}
        className={emptyFields.includes("clientEmail") ? "error" : ""}
        id="clientEmailField"
      />

      <label htmlFor="clientPhoneNumberField">Phone Number:</label>
      <input
        type="number"
        onChange={(e) => setClientPhoneNumber(e.target.value)}
        value={clientPhoneNumber}
        className={emptyFields.includes("clientPhoneNumber") ? "error" : ""}
        id="clientPhoneNumberField"
      />

      <label htmlFor="clientStreetLineOneField">Address 1: </label>
      <input
        type="text"
        onChange={(e) => setClientStreetLineOne(e.target.value)}
        value={clientStreetLineOne}
        id="clientStreetLineOneField"
      />

      <label htmlFor="clientStreetLineTwoField">Address 2: </label>
      <input
        type="text"
        onChange={(e) => setClientStreetLineTwo(e.target.value)}
        value={clientStreetLineTwo}
        id="clientStreetLineTwoField"
      />

      <label htmlFor="clientCityField">City: </label>
      <input
        type="text"
        onChange={(e) => setClientCity(e.target.value)}
        value={clientCity}
        id="clientCityField"
      />

      <label htmlFor="clientStateField">State: </label>
      <input
        type="text"
        onChange={(e) => setClientState(e.target.value)}
        value={clientState}
        id="clientStateField"
      />

      <label htmlFor="clientZipField">Zip Code: </label>
      <input
        type="number"
        onChange={(e) => setClientZip(e.target.value)}
        value={clientZip}
        id="clientZipField"
      />

      <button>Create New Client</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default ClientForm;