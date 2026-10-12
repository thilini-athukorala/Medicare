import { useEffect, useState } from 'react';
import api from '../api';
import { formatDate, futureDates } from './Booking';

function ReschedulePanel({ appointment, doctor, onClose, onDone, onError }) {
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [timeSlot, setTimeSlot] = useState('');
  const dates = futureDates(doctor);

  useEffect(() => {
    setTimeSlot('');
    setSlots([]);
    if (!date) return;
    api.get(`/doctors/${doctor._id}/slots`, { params: { date } })
      .then(({ data }) => setSlots(data.slots))
      .catch((err) => onError(err.response?.data?.message || 'Could not load time slots'));
  }, [date]);

  const submit = async () => {
    try {
      await api.put(`/appointments/${appointment._id}/reschedule`, { appointmentDate: date, timeSlot });
      onDone();
    } catch (err) {
      onError(err.response?.data?.message || 'Could not reschedule');
    }
  };

  return (
    <div className="reschedule-panel">
      {dates.length === 0 ? (
        <p>You have no other available dates. Add some under My Availability first.</p>
      ) : (
        <>
          <select value={date} onChange={(e) => setDate(e.target.value)}>
            <option value="">New date</option>
            {dates.map((d) => <option key={d} value={d}>{formatDate(d)}</option>)}
          </select>
          <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} disabled={!date}>
            <option value="">{date ? (slots.length ? 'New time' : 'No free slots') : 'Pick a date first'}</option>
            {slots.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-small" disabled={!timeSlot} onClick={submit}>Move appointment</button>
        </>
      )}
      <button className="btn-small btn-secondary" onClick={onClose}>Close</button>
    </div>
  );
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [reschedulingId, setReschedulingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchAll = async () => {
    try {
      const [appts, profile] = await Promise.all([api.get('/appointments/doctor'), api.get('/doctors/me')]);
      setAppointments(appts.data);
      setDoctor(profile.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load appointments');
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (id, status) => {
    setError(''); setMessage('');
    if (status === 'CANCELLED' && !window.confirm('Cancel this appointment? The patient will see it as cancelled.')) return;
    try {
      await api.put(`/appointments/${id}/status`, { status });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update status');
    }
  };

  return (
    <div className="page">
      <h2>My Appointments</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      {appointments.length === 0 && <p>No appointments yet.</p>}

      <div className="appt-list">
        {appointments.map((a) => {
          const active = a.status === 'PENDING' || a.status === 'CONFIRMED';
          return (
            <div key={a._id}>
              <div className="appt-card">
                <div>
                  <b>{a.patient?.name || 'Deleted patient'}</b>
                  <span className="muted"> · {a.patient?.phone || a.patient?.email}</span>
                  <p>{new Date(a.appointmentDate).toLocaleDateString()} · {a.timeSlot}</p>
                  {a.reason && <p className="reason">{a.reason}</p>}
                </div>
                <div className="appt-meta">
                  <span className={`status status-${a.status.toLowerCase()}`}>{a.status}</span>
                  {a.status === 'PENDING' && <button onClick={() => updateStatus(a._id, 'CONFIRMED')}>Confirm</button>}
                  {a.status === 'CONFIRMED' && <button onClick={() => updateStatus(a._id, 'COMPLETED')}>Mark Completed</button>}
                  {active && (
                    <button className="btn-secondary" onClick={() => setReschedulingId(reschedulingId === a._id ? null : a._id)}>
                      Change time
                    </button>
                  )}
                  {active && <button className="danger" onClick={() => updateStatus(a._id, 'CANCELLED')}>Cancel</button>}
                </div>
              </div>
              {reschedulingId === a._id && doctor && (
                <ReschedulePanel
                  appointment={a}
                  doctor={doctor}
                  onClose={() => setReschedulingId(null)}
                  onDone={() => { setReschedulingId(null); setMessage('Appointment moved.'); fetchAll(); }}
                  onError={setError}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
