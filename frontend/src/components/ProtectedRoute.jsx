import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Simple check for token existence. 
  // For production, you might want to decode/verify expiration, 
  // but presence is enough for client-side routing protection.
  const token = localStorage.getItem('token');

  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
