import { useState } from "react";
import { useInvoicesContext } from "../hooks/useInvoicesContext";

const InvoiceForm = () => {
  const { dispatch } = useInvoicesContext();
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const invoice = { clientName, date, price, invoiceNumber, description };

    const response = await fetch("/invoices", {
      method: "POST",
      body: JSON.stringify(invoice),
      headers: {
        "Content-Type": "application/json",
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
      setInvoiceNumber("");
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

      <label>Invoice for Client: </label>
      <input
        type="text"
        onChange={(e) => setClientName(e.target.value)}
        value={clientName}
        className={emptyFields.includes("clientName") ? "error" : ""}
      />

      <label>Date of Service: </label>
      <input
        type="date"
        onChange={(e) => setDate(e.target.value)}
        value={date}
        className={emptyFields.includes("date") ? "error" : ""}
      />

      <label>Price: </label>
      <input
        type="number"
        onChange={(e) => setPrice(e.target.value)}
        value={price}
        className={emptyFields.includes("price") ? "error" : ""}
      />

      <label>Invoice Number: </label>
      <input
        type="number"
        onChange={(e) => setInvoiceNumber(e.target.value)}
        value={invoiceNumber}
        className={emptyFields.includes("invoiceNumber") ? "error" : ""}
      />

      <label>Service Description: </label>
      <input
        type="text"
        onChange={(e) => setDescription(e.target.value)}
        value={description}
        className={emptyFields.includes("description") ? "error" : ""}
      />

      <button>Create New Invoice</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default InvoiceForm;
