import { useState } from "react";
import { useInvoicesContext } from "../../hooks/useInvoicesContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useClientsContext } from "../../hooks/useClientsContext";

const InvoiceForm = () => {
  const { dispatch } = useInvoicesContext();
  const { user, logout } = useAuthContext();
  const { clients } = useClientsContext();

  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Login required");
      return;
    }

    const invoice = {
      clientId,
      date,
      amount,
      description,
    };

    try {
      const response = await fetch("/invoices", {
        method: "POST",
        body: JSON.stringify(invoice),
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
        setEmptyFields(json.emptyFields);
        console.log(json.emptyFields);
      }
      if (response.ok) {
        setDate("");
        setClientId("");
        setAmount("");
        setDescription("");
        setError(null);
        setEmptyFields([]);
        dispatch({ type: "CREATE_INVOICE", payload: json });
      }
    } catch (err) {
      console.error("Failed to create invoice", err);
    }
  };

  return (
    <form className="create" onSubmit={handleSubmit}>
      <h3>Add a new invoice</h3>

      <label htmlFor="clientIdField"> Invoice for Client: </label>
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

      <label htmlFor="dateField">Date of Service: </label>
      <input
        type="date"
        onChange={(e) => setDate(e.target.value)}
        value={date}
        className={emptyFields.includes("date") ? "error" : ""}
        id="dateField"
      />

      <label htmlFor="amountField">Amount: </label>
      <input
        type="number"
        onChange={(e) => setAmount(e.target.value)}
        value={amount}
        className={emptyFields.includes("amount") ? "error" : ""}
        id="amountField"
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
