import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useInvoicesContext } from "../hooks/useInvoicesContext";

import InvoiceDetails from "../components/InvoiceDetails";
import InvoiceForm from "../components/forms/InvoiceForm";
import InvoiceSearch from "../components/forms/InvoiceSearch";
import Pagination from "../components/Pagination.js";

const Invoice = () => {
  const { user, logout } = useAuthContext();
  const { invoices, dispatch } = useInvoicesContext();
  const [startDateSearch, setStartDateSearch] = useState("");
  const [endDateSearch, setEndDateSearch] = useState("");

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

  if (!invoices) {
    return <div>Loading...</div>;
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = invoices.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-separation">
      <div className="invoices">
        <h3>Invoices Page</h3>
        <InvoiceSearch
          setStartDateSearch={setStartDateSearch}
          setEndDateSearch={setEndDateSearch}
        />
        {invoices.length > 0 ? (
          currentItems.map((invoice) => (
            <InvoiceDetails key={invoice._id} invoice={invoice} />
          ))
        ) : (
          <p className="no-statements">No Invoices Yet</p>
        )}
        {invoices.length > itemsPerPage && (
          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={invoices.length}
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
