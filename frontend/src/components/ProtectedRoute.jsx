import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ adminOnly = false }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to={adminOnly ? "/admin" : "/"} replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role || 'user';

    if (adminOnly && userRole !== 'admin') {
      return <Navigate to="/menu" replace />; // Students trying to access admin pages
    }

    return <Outlet />;
  } catch (e) {
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
