import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function PrivateRoute({ children, role = 'admin' }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}