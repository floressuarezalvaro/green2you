const PrintStatement = async (user, id) => {
  if (!user) {
    console.error("User is not authenticated");
    return;
  }

  try {
    const response = await fetch(`/api/statements/print/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/pdf",
      },
    });

    if (!response.ok) {
      throw new Error("Could not fetch client PDF");
    }

    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "statement.pdf";

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const printWindow = window.open(url);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Error downloading and printing invoice:", error);
  }
};

export default PrintStatement;
