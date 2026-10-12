import { useEffect, useState } from 'react';
import api from '../api';
import { formatDate } from './Booking';

const today = () => new Date().toISOString().slice(0, 10);

export default function DoctorAvailability() {
  const [entries, setEntries] = useState([]);
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [form, setForm] = useState({ date: '', startTime: '09:00', endTime: '13:00' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    api.get('/doctors/me')
      .then(({ data }) => {
        setEntries(data.availability || []);
        setSlotMinutes(data.slotMinutes || 30);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load your profile'));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addEntry = (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (form.startTime >= form.endTime) {
      setError('End time must be after the start time');
      return;
    }
    const next = entries.filter((x) => x.date !== form.date).concat({ ...form });
    next.sort((a, b) => a.date.localeCompare(b.date));
    setEntries(next);
    setForm({ ...form, date: '' });
    setDirty(true);
  };

  const removeEntry = (date) => {
    setEntries(entries.filter((x) => x.date !== date));
    setDirty(true);
  };

  const save = async () => {
    setError(''); setMessage('');
    try {
      await api.put('/doctors/me/availability', { availability: entries, slotMinutes });
      setMessage('Availability saved. Patients can now book these times.');
      setDirty(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save availability');
    }
  };

  const upcoming = entries.filter((x) => x.date >= today());
  const past = entries.filter((x) => x.date < today());

  return (
    <div className="page">
      <h2>My Availability</h2>
      <p className="subtitle">Choose the dates and hours you can see patients. Patients can only book inside these times.</p>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <form className="admin-form" onSubmit={addEntry}>
        <h3>Add an available date</h3>
        <div className="form-grid three">
          <div>
            <label>Date</label>
            <input type="date" name="date" min={today()} value={form.date} onChange={handleChange} required />
          </div>
          <div>
            <label>From</label>
            <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
          </div>
          <div>
            <label>To</label>
            <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit">Add date</button>
        </div>
      </form>

      <div className="admin-form">
        <h3>Appointment length</h3>
        <select value={slotMinutes} onChange={(e) => { setSlotMinutes(Number(e.target.value)); setDirty(true); }}>
          {[15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} minutes per patient</option>)}
        </select>
      </div>

      <h3 className="section-title">Upcoming available dates</h3>
      {upcoming.length === 0 && <p>No dates added yet. Add one above, then press Save.</p>}
      <div className="appt-list">
        {upcoming.map((x) => (
          <div className="appt-card" key={x.date}>
            <div>
              <b>{formatDate(x.date)}</b>
              <p>{x.startTime} - {x.endTime}</p>
            </div>
            <button className="btn-small danger" onClick={() => removeEntry(x.date)}>Remove</button>
          </div>
        ))}
      </div>

      {past.length > 0 && (
        <p className="muted">{past.length} past date(s) are kept in your history and hidden from patients.</p>
      )}

      <div className="save-bar">
        <button onClick={save} disabled={!dirty}>{dirty ? 'Save changes' : 'All changes saved'}</button>
      </div>
    </div>
  );
}
