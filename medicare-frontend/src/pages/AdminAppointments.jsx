import { useEffect, useState } from 'react';
import api from '../api';

const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load appointments');
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const updateStatus = async (id, status) => {
    setError('');
    try {
      await api.put(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update status');
    }
  };

  const visible = filter === 'ALL' ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div className="page">
      <h2>All Appointments</h2>
      {error && <p className="error">{error}</p>}

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            {' '}({f === 'ALL' ? appointments.length : appointments.filter((a) => a.status === f).length})
          </button>
        ))}
      </div>

      {visible.length === 0 && <p>No appointments to show.</p>}

      <div className="appt-list">
        {visible.map((a) => (
          <div className="appt-card" key={a._id}>
            <div>
              <b>{a.patient?.name || 'Deleted patient'}</b>
              <span className="muted"> · {a.patient?.email}</span>
              <p>
                with <b>{a.doctor?.name || 'Deleted doctor'}</b> ({a.doctor?.specialty})
              </p>
              <p>{new Date(a.appointmentDate).toLocaleDateString()} · {a.timeSlot}</p>
              {a.reason && <p className="reason">{a.reason}</p>}
            </div>
            <div className="appt-meta">
              <span className={`status status-${a.status.toLowerCase()}`}>{a.status}</span>
              {a.status === 'PENDING' && (
                <button onClick={() => updateStatus(a._id, 'CONFIRMED')}>Confirm</button>
              )}
              {a.status === 'CONFIRMED' && (
                <button onClick={() => updateStatus(a._id, 'COMPLETED')}>Mark Completed</button>
              )}
              {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                <button className="danger" onClick={() => updateStatus(a._id, 'CANCELLED')}>Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
