import { useState } from "react";

const ClientSearch = ({ setClientName }) => {
  const [clientName, setClientNameLocal] = useState("");

  const handleInputChange = (e) => {
    setClientNameLocal(e.target.value);
    setClientName(e.target.value);
  };

  return (
    <div className="search-wrapper">
      <form className="search">
        <input
          type="text"
          onChange={handleInputChange}
          value={clientName}
          id="clientNameField"
          placeholder="Client Quick Search"
        />
      </form>
    </div>
  );
};

export default ClientSearch;
