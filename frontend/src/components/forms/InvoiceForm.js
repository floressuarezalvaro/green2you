import { useState } from "react";
import { useInvoicesContext } from "../../hooks/useInvoicesContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useClientsContext } from "../../hooks/useClientsContext";

const InvoiceForm = () => {
  const { dispatch } = useInvoicesContext();
  const { user } = useAuthContext();
  const { clients } = useClientsContext();

  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Login required");
      return;
    }

    const selectedClient = clients.find(
      (client) => client.clientName === clientName
    );

    if (!selectedClient) {
      setError("Please select a valid client. Then try again");
      setEmptyFields(["clientName"]);
      return;
    }

    const invoice = {
      clientName,
      clientId: selectedClient._id,
      date,
      price,
      description,
    };

    const response = await fetch("/invoices", {
      method: "POST",
      body: JSON.stringify(invoice),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      setError(json.error);
      setEmptyFields(json.emptyFields);
      console.log(json.emptyFields);
    }
    if (response.ok) {
      setClientName("");
      setDate("");
      setPrice("");
      setDescription("");
      setError(null);
      setEmptyFields([]);
      console.log("New Invoice Added", json);
      dispatch({ type: "CREATE_INVOICE", payload: json });
    }
  };

  return (
    <form className="create" onSubmit={handleSubmit}>
      <h3>Add a new invoice</h3>

      <label htmlFor="clientNameField"> Invoice for Client: </label>
      <select
        name="clientNameField"
        id="clientNameField"
        onChange={(e) => {
          setClientName(e.target.value);
          setError(null);
        }}
        value={clientName}
        className={emptyFields.includes("clientName") ? "error" : ""}
      >
        <option value="">Select a client</option>
        {clients &&
          clients.map((client) => (
            <option key={client._id} value={client.clientName}>
              {client.clientName}
            </option>
          ))}
      </select>

      <label htmlFor="dateField">Date of Service: </label>
      <input
        type="date"
        onChange={(e) => setDate(e.target.value)}
        value={date}
        className={emptyFields.includes("date") ? "error" : ""}
        id="dateField"
      />

      <label htmlFor="priceField">Price: </label>
      <input
        type="number"
        onChange={(e) => setPrice(e.target.value)}
        value={price}
        className={emptyFields.includes("price") ? "error" : ""}
        id="priceField"
      />

      <label htmlFor="descriptionField">Service Description: </label>
      <input
        type="text"
        onChange={(e) => setDescription(e.target.value)}
        value={description}
        className={emptyFields.includes("description") ? "error" : ""}
        id="descriptionField"
      />

      <button>Create New Invoice</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default InvoiceForm;
