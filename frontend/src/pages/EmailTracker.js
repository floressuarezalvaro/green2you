import React, { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import Pagination from "../components/Pagination";

const EmailTable = () => {
  const { user } = useAuthContext();
  const [emails, setEmails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchEmails = async () => {
      if (!user) return;
      try {
        const response = await fetch("/emails?days=60", {
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
        setEmails(json);
      } catch (error) {
        console.error("Error fetching email data:", error);
      }
    };

    fetchEmails();
  }, [user]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = emails.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="email-wrapper">
      <h3>Email Tracker</h3>
      <table>
        <thead className="table-header">
          <tr>
            <th>Email Type</th>
            <th>Email To</th>
            <th>Email Subject</th>
            <th>Email Text</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((email) => (
            <tr key={email._id}>
              <td>{email.emailType}</td>
              <td>{email.emailTo}</td>
              <td>{email.emailSubject}</td>
              <td>{email.emailText}</td>
              <td>{new Date(email.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={emails.length}
        paginate={paginate}
        currentPage={currentPage}
      />
    </div>
  );
};

export default EmailTable;
