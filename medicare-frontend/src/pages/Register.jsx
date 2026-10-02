import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: 'PATIENT', specialty: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect to server');
    }
  };

  return (
    <div className="card">
      <h2>Create Account</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={handleChange} minLength={6} required />
        <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={handleChange} />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="PATIENT">I am a Patient</option>
          <option value="DOCTOR">I am a Doctor</option>
        </select>
        {form.role === 'DOCTOR' && (
          <input name="specialty" placeholder="Specialty (e.g. Cardiology)" value={form.specialty} onChange={handleChange} required />
        )}
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
