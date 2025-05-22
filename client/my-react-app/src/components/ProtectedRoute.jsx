import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requireOrganizer = false }) => {
  const { user, isOrganizer, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (requireOrganizer && !isOrganizer) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
