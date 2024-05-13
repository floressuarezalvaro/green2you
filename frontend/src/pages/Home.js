import { useEffect } from "react";
import { useInvoicesContext } from "../hooks/useInvoicesContext";
import { useAuthContext } from "../hooks/useAuthContext";

// components
import InvoiceDetails from "../components/InvoiceDetails";
import InvoiceForm from "../components/InvoiceForm";

const Home = () => {
  const { invoices, dispatch } = useInvoicesContext();
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchInvoices = async () => {
      const response = await fetch("/invoices", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: "SET_INVOICES", payload: json });
      }
    };

    if (user) {
      fetchInvoices();
    }
  }, [dispatch, user]);
  return (
    <div className="home">
      <div className="invoices">
        {invoices &&
          invoices.map((invoice) => (
            <InvoiceDetails key={invoice._id} invoice={invoice} />
          ))}
      </div>
      <InvoiceForm />
    </div>
  );
};

export default Home;
