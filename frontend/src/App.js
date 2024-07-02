import { Routes, Route } from "react-router-dom";
import RoleBasedRoute from "./components/RoleBasedRoute";

// pages & components
import Home from "./pages/Home";
import Invoice from "./pages/Invoice";
import Client from "./pages/Client";
import Profile from "./pages/Profile";
import Statement from "./pages/Statement";
import LogIn from "./pages/Login";
import ForgotResetPassword from "./pages/ForgotResetPassword";
import NavigationBar from "./components/Navbar";
import TokenToEmail from "./pages/TokenToEmail";
import EmailTable from "./pages/EmailTracker";

function App() {
  return (
    <div className="App">
      <NavigationBar />
      <div className="pages">
        <Routes>
          <Route path="/login" element={<LogIn />} />
          <Route path="/" element={<Home />} />
          <Route path="/forgotpassword" element={<TokenToEmail />} />
          <Route
            path="/resetpassword/:token"
            element={<ForgotResetPassword />}
          />
          <Route
            path="/profile/:clientId"
            element={
              <RoleBasedRoute role="client">
                <Profile />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <RoleBasedRoute role="admin">
                <Invoice />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <RoleBasedRoute role="admin">
                <Client />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/statements"
            element={
              <RoleBasedRoute role="admin">
                <Statement />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/emails"
            element={
              <RoleBasedRoute role="admin">
                <EmailTable />
              </RoleBasedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
