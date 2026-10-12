import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Only lets logged-in users in. If `roles` is given, only those roles may see the page.
export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
