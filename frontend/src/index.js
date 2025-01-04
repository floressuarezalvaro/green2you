import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";
import { AuthContextProvider } from "./context/authContext";
import { ClientsContextProvider } from "./context/ClientContext";
import { InvoicesContextProvider } from "./context/InvoiceContext";
import { StatementsContextProvider } from "./context/StatementContext";
import { PaymentsContextProvider } from "./context/PaymentContext";
import { BalancesContextProvider } from "./context/BalanceContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <ClientsContextProvider>
          <InvoicesContextProvider>
            <StatementsContextProvider>
              <PaymentsContextProvider>
                <BalancesContextProvider>
                  <App />
                </BalancesContextProvider>
              </PaymentsContextProvider>
            </StatementsContextProvider>
          </InvoicesContextProvider>
        </ClientsContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
