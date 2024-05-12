import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { InvoicesContextProvider } from "./context/InvoiceContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <InvoicesContextProvider>
      <App />
    </InvoicesContextProvider>
  </React.StrictMode>
);
