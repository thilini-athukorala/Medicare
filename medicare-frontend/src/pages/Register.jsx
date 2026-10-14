import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect to the server. Check that the backend is running.');
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="auth-form">
        <h2>Create your account</h2>
        <p className="lead">It takes less than a minute.</p>
        {error && <p className="error" role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" autoComplete="name" value={form.name} onChange={handleChange} required autoFocus />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <div className="pw-field">
              <input id="password" name="password" type={showPw ? 'text' : 'password'} autoComplete="new-password"
                value={form.password} onChange={handleChange} minLength={6} required />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="field-hint">At least 6 characters.</p>
          </div>
          <div>
            <label htmlFor="phone">Phone <span className="muted">(optional)</span></label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} />
          </div>
          <button type="submit" className="btn-block" disabled={loading}>
            {loading && <span className="btn-spinner" />}
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="switch">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </AuthShell>
  );
}
