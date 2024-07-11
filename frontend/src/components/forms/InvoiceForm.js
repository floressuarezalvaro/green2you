import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useInvoicesContext } from "../../hooks/useInvoicesContext";
import { useClientsContext } from "../../hooks/useClientsContext";

import ClientSelect from "../ClientSelect";

const InvoiceForm = () => {
  const { user, logout } = useAuthContext();
  const { dispatch } = useInvoicesContext();
  const { clients } = useClientsContext();

  const [clientId, setClientId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const [clientPlan, setClientPlan] = useState("");

  useEffect(() => {
    const selectedClient = clients.find((client) => client._id === clientId);
    if (selectedClient) {
      setClientPlan(selectedClient.clientPlan);
    } else {
      setClientPlan("");
    }
  }, [clientId, clients]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      logout();
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
        setEmptyFields(json.emptyFields || []);
        console.log(json.emptyFields);
      }
      if (response.ok) {
        setDate("");
        setClientId("");
        setSearchQuery("");
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
      <h3>Add Invoice</h3>

      <ClientSelect
        clients={clients}
        clientId={clientId}
        setClientId={setClientId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        emptyFields={emptyFields}
      />

      <label htmlFor="dateField">Date of Service</label>
      <input
        type="date"
        onChange={(e) => setDate(e.target.value)}
        value={date}
        className={emptyFields.includes("date") ? "error" : ""}
        id="dateField"
      />

      <label htmlFor="amountField">Amount</label>
      <input
        type="number"
        onChange={(e) => setAmount(e.target.value)}
        value={amount}
        placeholder={clientPlan}
        className={emptyFields.includes("amount") ? "error" : ""}
        id="amountField"
      />

      <label htmlFor="descriptionField">Service Description</label>
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
