import { useClientsContext } from "../hooks/useClientsContext";
import { useAuthContext } from "../hooks/useAuthContext";

const DeleteClient = ({ client }) => {
  const { dispatch } = useClientsContext();
  const { user } = useAuthContext();

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!user) {
      return;
    }

    const response = await fetch("/clients/" + client._id, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    const json = await response.json();

    if (response.ok) {
      dispatch({ type: "DELETE_CLIENT", payload: json });
    }
  };
  return (
    <span className="material-symbols-outlined" onClick={handleDelete}>
      delete
    </span>
  );
};

export default DeleteClient;
