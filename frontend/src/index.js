import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";
import { ClientsContextProvider } from "./context/ClientContext";
import { InvoicesContextProvider } from "./context/InvoiceContext";
import { AuthContextProvider } from "./context/authContext";
import { StatementsContextProvider } from "./context/StatementContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <ClientsContextProvider>
          <InvoicesContextProvider>
            <StatementsContextProvider>
              <App />
            </StatementsContextProvider>
          </InvoicesContextProvider>
        </ClientsContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
