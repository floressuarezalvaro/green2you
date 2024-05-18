import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";
import { InvoicesContextProvider } from "./context/InvoiceContext";
import { AuthContextProvider } from "./context/authContext";
import { ClientsContextProvider } from "./context/ClientContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <InvoicesContextProvider>
        <ClientsContextProvider>
          <App />
        </ClientsContextProvider>
      </InvoicesContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);
