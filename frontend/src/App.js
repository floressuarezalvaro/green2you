import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";

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
import Payment from "./pages/Payment";

function App() {
  const { user } = useAuthContext();

  return (
    <div className="App">
      <NavigationBar />
      <div className="pages">
        <Routes>
          <Route
            path="/login"
            element={!user ? <LogIn /> : <Navigate to="/" />}
          />
          <Route
            path="/forgotpassword"
            element={!user ? <TokenToEmail /> : <Navigate to="/" />}
          />
          <Route
            path="/resetpassword/:token"
            element={!user ? <ForgotResetPassword /> : <Navigate to="/" />}
          />
          <Route
            path="/"
            element={user ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/invoices"
            element={
              user && user.role === "admin" ? (
                <Invoice />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/clients"
            element={
              user && user.role === "admin" ? (
                <Client />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/profile/:clientId"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/statements"
            element={
              user && user.role === "admin" ? (
                <Statement />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/payments"
            element={
              user && user.role === "admin" ? (
                <Payment />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/logs"
            element={
              user && user.role === "admin" ? (
                <EmailTable />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
