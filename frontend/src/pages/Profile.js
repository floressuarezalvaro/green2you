import { useEffect, useState } from "react";
import { useInvoicesContext } from "../hooks/useInvoicesContext";
import { useClientsContext } from "../hooks/useClientsContext";
import { useAuthContext } from "../hooks/useAuthContext";

const Profile = () => {
  const { invoices, dispatch } = useInvoicesContext();
  const { clients } = useClientsContext();
  const { user } = useAuthContext();

  const [clientId, setClientId] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user || !clientId) return;
      try {
        const response = await fetch(`/invoices?clientId=${clientId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Handle unauthorized
          }
          return;
        }

        const json = await response.json();
        dispatch({ type: "SET_INVOICES", payload: json });
        console.log(json);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      }
    };

    fetchInvoices();
  }, [dispatch, user, clientId]);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!user) {
  //     setError("Login required");
  //     return;
  //   }

  //   const selectedProfile = { clientId };
  //   console.log(selectedProfile);
  // };

  return (
    <div className="invoices">
      <h3>Profile Page</h3>
      <form
        className="create"
        // onSubmit={handleSubmit}
      >
        <label htmlFor="clientIdField"> Select Client: </label>
        <select
          name="clientIdField"
          id="clientIdField"
          onChange={(e) => {
            setClientId(e.target.value);
          }}
          value={clientId}
        >
          <option value="">Select From List</option>
          {clients &&
            clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.clientName}
              </option>
            ))}
        </select>
        {/* <button>Select Profile</button> */}
      </form>

      {invoices &&
        invoices.map((invoice) => (
          <div key={invoice._id}>
            <div className="details">
              <p>
                <strong>Invoice ID: </strong>
                {invoice._id}
              </p>
              <p>
                <strong>Date of Service: </strong>
                {invoice.date}
              </p>
              <p>
                <strong>Price (USD): </strong>
                {invoice.price}
              </p>
              <p>
                <strong>Service Description: </strong>
                {invoice.description}
              </p>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Profile;
