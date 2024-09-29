import { useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";

const Home = () => {
  const { user, logout } = useAuthContext();

  useEffect(() => {
    if (!user) {
      logout();
    }
  }, [user, logout]);

  return (
    <div className="home">
      <h1>Welcome to Green2You</h1>
      <div className="home-details">
        <p>Click on the links above to navigate</p>
      </div>
    </div>
  );
};

export default Home;
