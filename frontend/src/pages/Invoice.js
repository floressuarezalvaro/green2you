import { useEffect } from "react";
import { useInvoicesContext } from "../hooks/useInvoicesContext";
import { useAuthContext } from "../hooks/useAuthContext";

// components
import InvoiceDetails from "../components/InvoiceDetails";
import InvoiceForm from "../components/forms/InvoiceForm";

const Invoice = () => {
  const { invoices, dispatch } = useInvoicesContext();
  const { user, logout } = useAuthContext();

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user) return;
      try {
        const response = await fetch("/invoices", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
          }
          return;
        }

        const json = await response.json();
        dispatch({ type: "SET_INVOICES", payload: json });
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      }
    };

    if (user) {
      fetchInvoices();
    }
  }, [dispatch, user, logout]);

  return (
    <div className="page-separation">
      <div className="invoices">
        <h3>Invoices Page</h3>
        {invoices &&
          invoices.map((invoice) => (
            <InvoiceDetails key={invoice._id} invoice={invoice} />
          ))}
      </div>
      <div>
        <InvoiceForm />
      </div>
    </div>
  );
};

export default Invoice;