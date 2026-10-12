import { useEffect, useState } from 'react';
import api from '../api';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments/my');
      setAppointments(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load appointments');
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel appointment');
    }
  };

  return (
    <div className="page">
      <h2>My Appointments</h2>
      {error && <p className="error">{error}</p>}
      {appointments.length === 0 && <p>You have no appointments yet.</p>}

      <div className="appt-list">
        {appointments.map((a) => (
          <div className="appt-card" key={a._id}>
            <div>
              <b>{a.doctor?.name}</b> ({a.doctor?.specialty})
              <p>{new Date(a.appointmentDate).toLocaleDateString()} · {a.timeSlot}</p>
              <p className="reason">{a.reason}</p>
            </div>
            <div className="appt-meta">
              <span className={`status status-${a.status.toLowerCase()}`}>{a.status}</span>
              {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                <button onClick={() => handleCancel(a._id)}>Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
