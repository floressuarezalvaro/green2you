const InvoiceSearch = ({ setStartDateSearch, setEndDateSearch }) => {
  return (
    <div className="date-search-wrapper">
      <div className="input-date-box">
        <p>Start Date:</p>
        <input
          type="date"
          placeholder="Start Date"
          onChange={(e) => setStartDateSearch(e.target.value)}
          id="startDateField"
        />
      </div>
      <div className="input-date-box">
        <p>End Date:</p>
        <input
          type="date"
          placeholder="End Date"
          onChange={(e) => setEndDateSearch(e.target.value)}
          id="endDateField"
        />
      </div>
    </div>
  );
};

export default InvoiceSearch;
