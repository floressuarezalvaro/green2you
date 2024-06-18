// create statement context

const PrintStatement = async (user, id) => {
  if (!user) {
    console.error("User is not authenticated");
    return;
  }

  try {
    const response = await fetch(`/statements/print/${id}`, {
      method: "GET",
      headers: {
        // Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/pdf",
      },
    });
    if (!response.ok) {
      throw new Error("Could not fetch client PDF");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create link to download PDF
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    link.remove();

    // optionally print
    const printWindow = window.open(url);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  } catch (error) {
    console.error("Error downloading and printing invoice:", error);
  }
};

export default PrintStatement;
