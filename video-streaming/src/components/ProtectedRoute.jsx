import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children, token }) => {
  return token ? children : <Navigate to="/" />;
};
export default ProtectedRoutes;
