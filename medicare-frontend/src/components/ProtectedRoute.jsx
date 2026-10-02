import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Only lets logged-in users see the page, otherwise sends them to /login
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}
