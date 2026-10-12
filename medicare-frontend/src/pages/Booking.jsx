import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export const formatDate = (key) =>
  new Date(`${key}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

export const futureDates = (doctor) => {
  const today = new Date().toISOString().slice(0, 10);
  return [...new Set((doctor?.availability || []).map((a) => a.date))].filter((d) => d >= today).sort();
};

export default function Booking() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get(`/doctors/${doctorId}`)
      .then(({ data }) => setDoctor(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load doctor'));
  }, [doctorId]);

  useEffect(() => {
    setTimeSlot('');
    setSlots([]);
    if (!date) return;
    api.get(`/doctors/${doctorId}/slots`, { params: { date } })
      .then(({ data }) => setSlots(data.slots))
      .catch((err) => setError(err.response?.data?.message || 'Could not load time slots'));
  }, [date, doctorId]);

  const dates = futureDates(doctor);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/appointments', { doctorId, appointmentDate: date, timeSlot, reason });
      setSuccess(true);
      setTimeout(() => navigate('/my-appointments'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not book appointment');
    }
  };

  return (
    <div className="page">
      <h2>Book Appointment</h2>
      {doctor && (
        <p className="subtitle">
          With <b>{doctor.name}</b> ({doctor.specialty}){doctor.hospital ? ` · ${doctor.hospital}` : ''}
        </p>
      )}
      {success && <p className="success">Appointment booked! Redirecting...</p>}
      {error && <p className="error">{error}</p>}

      {doctor && dates.length === 0 && (
        <p className="notice">This doctor has not opened any dates yet. Please check back later.</p>
      )}

      {doctor && dates.length > 0 && (
        <form className="card" onSubmit={handleSubmit}>
          <label>Available date</label>
          <select value={date} onChange={(e) => setDate(e.target.value)} required>
            <option value="">Select a date</option>
            {dates.map((d) => <option key={d} value={d}>{formatDate(d)}</option>)}
          </select>

          <label>Time slot</label>
          <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} required disabled={!date}>
            <option value="">{date ? (slots.length ? 'Select a time' : 'No free slots on this date') : 'Pick a date first'}</option>
            {slots.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <label>Reason for visit</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="Briefly describe your symptoms or reason" rows={3} />

          <button type="submit" disabled={!timeSlot}>Confirm Booking</button>
        </form>
      )}
    </div>
  );
}
