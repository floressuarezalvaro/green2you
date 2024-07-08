import { useParams } from "react-router-dom";

import { useAuthContext } from "../hooks/useAuthContext";
import { useClientsContext } from "../hooks/useClientsContext";

import ClientDetails from "../components/Profile/ProfileClientDetails";
import AccountSummary from "../components/Profile/AccountSummary.js";
import Statements from "../components/Profile/StatementAccordian.js";
import ProfileInvoices from "../components/Profile/ProfileInvoices.js";
import ProfilePayments from "../components/Profile/ProfilePayments.js";

const Profile = () => {
  const { user, logout } = useAuthContext();
  const { clientId } = useParams();
  const { clients } = useClientsContext();

  if (!user) {
    logout();
  }

  const selectedClient =
    clients?.find((client) => client._id === clientId) || null;

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
