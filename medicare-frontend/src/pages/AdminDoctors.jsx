import { useEffect, useState } from 'react';
import api from '../api';

const EMPTY = {
  name: '', email: '', password: '', specialty: '', hospital: '',
  qualification: '', experienceYears: '', consultationFee: '', bio: ''
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/doctors/admin/list');
      setDoctors(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load doctors');
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => { setForm(EMPTY); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    const payload = {
      ...form,
      experienceYears: Number(form.experienceYears) || 0,
      consultationFee: Number(form.consultationFee) || 0
    };
    if (!payload.password) delete payload.password; // blank = keep the current password
    try {
      if (editingId) {
        await api.put(`/doctors/${editingId}`, payload);
        setMessage('Doctor updated');
      } else {
        await api.post('/doctors', payload);
        setMessage('Doctor added. They can now log in with that email and password.');
      }
      resetForm();
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save doctor');
    }
  };

  const startEdit = (doc) => {
    setEditingId(doc._id);
    setForm({
      name: doc.name || '', email: doc.user?.email || '', password: '',
      specialty: doc.specialty || '', hospital: doc.hospital || '',
      qualification: doc.qualification || '', experienceYears: doc.experienceYears ?? '',
      consultationFee: doc.consultationFee ?? '', bio: doc.bio || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Remove ${doc.name}? Their login and appointments will be deleted too.`)) return;
    try {
      await api.delete(`/doctors/${doc._id}`);
      setMessage('Doctor removed');
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete doctor');
    }
  };

  return (
    <div className="page">
      <h2>Manage Doctors</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit doctor' : 'Add a new doctor'}</h3>
        <div className="form-grid">
          <input name="name" placeholder="Doctor name" value={form.name} onChange={handleChange} required />
          <input name="specialty" placeholder="Specialty (e.g. Cardiology)" value={form.specialty} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Login email" value={form.email} onChange={handleChange} required />
          <input
            name="password" type="password" value={form.password} onChange={handleChange}
            placeholder={editingId ? 'New password (leave blank to keep)' : 'Login password (min 6 characters)'}
            minLength={6} required={!editingId}
          />
          <input name="hospital" placeholder="Hospital" value={form.hospital} onChange={handleChange} />
          <input name="qualification" placeholder="Qualification (e.g. MBBS, MD)" value={form.qualification} onChange={handleChange} />
          <input name="experienceYears" type="number" min="0" placeholder="Years of experience" value={form.experienceYears} onChange={handleChange} />
          <input name="consultationFee" type="number" min="0" placeholder="Consultation fee (Rs.)" value={form.consultationFee} onChange={handleChange} />
        </div>
        <textarea name="bio" rows={2} placeholder="Short bio (optional)" value={form.bio} onChange={handleChange} />
        <div className="form-actions">
          <button type="submit">{editingId ? 'Save changes' : 'Add doctor'}</button>
          {editingId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancel edit</button>}
        </div>
      </form>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Login email</th><th>Specialty</th><th>Hospital</th><th>Fee</th><th></th></tr>
          </thead>
          <tbody>
            {doctors.length === 0 && (
              <tr><td colSpan="6" className="empty-cell">No doctors yet. Add the first one above.</td></tr>
            )}
            {doctors.map((d) => (
              <tr key={d._id}>
                <td><b>{d.name}</b></td>
                <td>{d.user?.email || '-'}</td>
                <td>{d.specialty}</td>
                <td>{d.hospital || '-'}</td>
                <td>Rs. {d.consultationFee}</td>
                <td className="row-actions">
                  <button className="btn-small" onClick={() => startEdit(d)}>Edit</button>
                  <button className="btn-small danger" onClick={() => handleDelete(d)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
