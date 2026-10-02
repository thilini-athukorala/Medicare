import { useAuth } from '../context/AuthContext';

// Temporary home page - we will replace this with real dashboards next
export default function Home() {
  const { user, logout } = useAuth();
  return (
    <div className="card">
      <h2>Welcome, {user.name}!</h2>
      <p>You are logged in as <b>{user.role}</b>.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
