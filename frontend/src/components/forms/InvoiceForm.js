import { useState } from "react";
import { useInvoicesContext } from "../../hooks/useInvoicesContext";
import { useAuthContext } from "../../hooks/useAuthContext";

const InvoiceForm = () => {
  const { dispatch } = useInvoicesContext();
  const { user } = useAuthContext();

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

    const invoice = { clientName, date, price, description };

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
      <input
        type="text"
        onChange={(e) => setClientName(e.target.value)}
        value={clientName}
        className={emptyFields.includes("clientName") ? "error" : ""}
        id="clientNameField"
      />

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
