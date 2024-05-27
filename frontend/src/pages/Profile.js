import { useEffect, useState } from "react";
import { useInvoicesContext } from "../hooks/useInvoicesContext";
import { useClientsContext } from "../hooks/useClientsContext";
import { useAuthContext } from "../hooks/useAuthContext";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

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

  const selectedClient = clients.find((client) => client._id === clientId);

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
      </form>

      {selectedClient && (
        <div className="details">
          <h3>Profile </h3>
          <h4>{selectedClient.clientName}</h4>
          <p>
            <strong>Email: </strong>
            {selectedClient.clientEmail}
          </p>
          <p>
            <strong>Phone Number: </strong>
            {selectedClient.clientPhoneNumber}
          </p>
          <p>
            <strong>Address 1: </strong>
            {selectedClient.clientStreetLineOne}
          </p>
          <p>
            <strong>Address 2: </strong>
            {selectedClient.clientStreetLineTwo}
          </p>
          <p>
            <strong>City: </strong>
            {selectedClient.clientCity}
          </p>
          <p>
            <strong>State: </strong>
            {selectedClient.clientState}
          </p>
          <p>
            <strong>Zip Code: </strong>
            {selectedClient.clientZip}
          </p>
          <p>
            <strong>Cycle Date: </strong>
            {selectedClient.clientCycleDate}
          </p>
          <p>
            Created:{" "}
            {formatDistanceToNow(new Date(selectedClient.createdAt), {
              addSuffix: true,
            })}
          </p>
          <p>
            Updated:{" "}
            {formatDistanceToNow(new Date(selectedClient.updatedAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      )}

      {selectedClient && <h3>Invoices </h3>}
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
