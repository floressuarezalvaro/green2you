const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const maxPageNumbers = 12;
  const pages = [];

  let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
  let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);

  if (endPage === totalPages && endPage - startPage < maxPageNumbers) {
    startPage = Math.max(1, endPage - maxPageNumbers + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const showPrevious = startPage > 1;
  const showNext = endPage < totalPages;

  return (
    <nav>
      <ul className="pagination">
        {showPrevious && (
          <li>
            <button onClick={() => paginate(currentPage - 1)}>Previous</button>
          </li>
        )}
        {pages.map((page) => (
          <li key={page}>
            <button
              onClick={() => paginate(page)}
              className={page === currentPage ? "active" : ""}
            >
              {page}
            </button>
          </li>
        ))}
        {showNext && (
          <li>
            <button onClick={() => paginate(currentPage + 1)}>Next</button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;
