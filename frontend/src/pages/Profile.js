import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useAuthContext } from "../hooks/useAuthContext";

import ClientDetails from "../components/Profile/ProfileClientDetails";
import AccountSummary from "../components/Profile/AccountSummary.js";
import Statements from "../components/Profile/StatementAccordian.js";
import ProfileInvoices from "../components/Profile/ProfileInvoices.js";
import ProfilePayments from "../components/Profile/ProfilePayments.js";

const Profile = () => {
  const { user, logout } = useAuthContext();
  const { clientId } = useParams();

  const [selectedClient, setSelectedClient] = useState(null);

  if (!user) {
    logout();
  }

  useEffect(() => {
    const fetchClient = async () => {
      if (!user || !clientId) return;

      try {
        const response = await fetch(`/clients/${clientId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            logout();
          }
          return;
        }

        const clientData = await response.json();
        setSelectedClient(clientData);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      }
    };

    fetchClient();
  }, [user, logout, clientId]);

  return (
    <div className="profile">
      <h3>Profile Page</h3>
      {selectedClient ? (
        <>
          <ClientDetails client={selectedClient} />
          <AccountSummary client={selectedClient._id} />
          <Statements client={selectedClient._id} />
          <ProfileInvoices client={selectedClient._id} />
          <ProfilePayments client={selectedClient._id} />
        </>
      ) : (
        <p>Client not found.</p>
      )}
    </div>
  );
};

export default Profile;
