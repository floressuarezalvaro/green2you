import { useInvoicesContext } from "../hooks/useInvoicesContext";
import { useAuthContext } from "../hooks/useAuthContext";

const DeleteInvoice = ({ invoice }) => {
  const { dispatch } = useInvoicesContext();
  const { user } = useAuthContext();

  const DeleteInvoice = async () => {
    if (!user) {
      return;
    }

    const response = await fetch("/invoices/" + invoice._id, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    const json = await response.json();

    if (response.ok) {
      dispatch({ type: "DELETE_INVOICE", payload: json });
    }
  };
  return (
    <span className="material-symbols-outlined" onClick={DeleteInvoice}>
      delete
    </span>
  );
};

export default DeleteInvoice;
