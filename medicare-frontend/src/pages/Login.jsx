import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect to the server. Check that the backend is running.');
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="auth-form">
        <h2>Welcome back</h2>
        <p className="lead">Log in to book and manage your appointments.</p>
        {error && <p className="error" role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <div className="pw-field">
              <input id="password" type={showPw ? 'text' : 'password'} autoComplete="current-password"
                placeholder="Enter your password" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-block" disabled={loading}>
            {loading && <span className="btn-spinner" />}
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="switch">New to MediCare? <Link to="/register">Create an account</Link></p>
      </div>
    </AuthShell>
  );
}
