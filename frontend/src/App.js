import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";

// pages & components
import Home from "./pages/Home";
import Client from "./pages/Client";
import LogIn from "./pages/Login";
import SignUp from "./pages/SignUp";
import Navbar from "./components/Navbar";

function App() {
  const { user } = useAuthContext();
  const showMeUser = console.log(user);

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="pages">
          <Routes>
            <Route
              path="/"
              element={user ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={!user ? <LogIn /> : <Navigate to="/" />}
            />
            <Route
              path="/signup"
              element={!user ? <SignUp /> : <Navigate to="/" />}
            />
            <Route
              path="/clients"
              element={user ? <Client /> : showMeUser}
              // element={<Client />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
