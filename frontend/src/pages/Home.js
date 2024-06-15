import { useAuthContext } from "../hooks/useAuthContext";

const Home = () => {
  const { user, logout } = useAuthContext();

  if (!user) {
    logout();
  }

  return (
    <div className="Home">
      <h1>Welcome to the Home page</h1>
      <p>Click on the links above to navigate</p>
    </div>
  );
};

export default Home;
