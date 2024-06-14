import { useAuthContext } from "../hooks/useAuthContext";

const Home = () => {
  const { user, logout } = useAuthContext();

  if (!user) {
    logout();
  }

  return <div></div>;
};

export default Home;
