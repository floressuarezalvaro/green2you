import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useInvoicesContext } from "../hooks/useInvoicesContext";
import { useClientsContext } from "../hooks/useClientsContext.js";

import InvoiceDetails from "../components/InvoiceDetails";
import InvoiceForm from "../components/forms/InvoiceForm";
import InvoiceSearch from "../components/forms/InvoiceSearch";
import Pagination from "../components/Pagination.js";
import ClientSearch from "../components/forms/ClientSearch.js";

const Invoice = () => {
  const { user, logout } = useAuthContext();
  const { invoices, dispatch } = useInvoicesContext();
  const { clients } = useClientsContext();

  const [startDateSearch, setStartDateSearch] = useState("");
  const [endDateSearch, setEndDateSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user) {
        logout();
      }

      const query = new URLSearchParams();
      if (startDateSearch) query.append("startDate", startDateSearch);
      if (endDateSearch) query.append("endDate", endDateSearch);

      try {
        const response = await fetch(`/api/invoices?${query.toString()}`, {
          method: "GET",
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

        const json = await response.json();
        dispatch({ type: "SET_INVOICES", payload: json });
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      }
    };

    fetchInvoices();
  }, [user, dispatch, logout, startDateSearch, endDateSearch]);

  if (!invoices || !clients) {
    return <div>Loading...</div>;
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const client = clients.find((client) => client._id === invoice.clientId);
    const matchesSearch =
      !searchTerm ||
      (client?.clientName &&
        client.clientName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStartDate =
      !startDateSearch || new Date(invoice.date) >= new Date(startDateSearch);
    const matchesEndDate =
      !endDateSearch || new Date(invoice.date) <= new Date(endDateSearch);

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInvoices.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-separation">
      <div className="invoices">
        <h3>Invoices Page</h3>
        <InvoiceSearch
          setStartDateSearch={setStartDateSearch}
          setEndDateSearch={setEndDateSearch}
        />
        <ClientSearch setClientName={setSearchTerm} />
        {filteredInvoices.length > 0 ? (
          currentItems.map((invoice) => {
            const client = clients.find(
              (client) => client._id === invoice.clientId
            );
            return (
              <InvoiceDetails
                key={invoice._id}
                invoice={invoice}
                client={client}
                user={user}
              />
            );
          })
        ) : (
          <p className="no-statements">No Invoices Yet</p>
        )}
        {filteredInvoices.length > itemsPerPage && (
          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={filteredInvoices.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        )}
      </div>
      <div className="form-container">
        <InvoiceForm />
      </div>
    </div>
  );
};

export default Invoice;
