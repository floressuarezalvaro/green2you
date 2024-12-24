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

import { datadogRum } from "@datadog/browser-rum";

datadogRum.init({
  applicationId: "6f5b4d77-7a68-4f20-8bdc-82db3058b473",
  clientToken: "pub66e319e9f76dfc11d89eb468c743c71c",
  site: "us3.datadoghq.com",
  service: "green2you-prod",
  version: "1.0.0",
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: "mask-user-input",
});

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
