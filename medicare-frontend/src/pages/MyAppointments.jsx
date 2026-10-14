import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ConfirmDialog, EmptyState, useToast } from '../components/ui';

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' }
];

const tabOf = (a) => {
  if (a.status === 'CANCELLED') return 'cancelled';
  if (a.status === 'COMPLETED') return 'past';
  const day = new Date(a.appointmentDate).toISOString().slice(0, 10);
  return day < new Date().toISOString().slice(0, 10) ? 'past' : 'upcoming';
};

const STATUS_TEXT = { PENDING: 'Pending', CONFIRMED: 'Confirmed', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };

export default function MyAppointments() {
  const { notify } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('upcoming');
  const [toCancel, setToCancel] = useState(null);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments/my');
      setAppointments(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const confirmCancel = async () => {
    const id = toCancel._id;
    setToCancel(null);
    try {
      await api.put(`/appointments/${id}/cancel`);
      notify('Appointment cancelled.');
      fetchAppointments();
    } catch (err) {
      notify(err.response?.data?.message || 'Could not cancel appointment', 'error');
    }
  };

  const counts = TABS.reduce((acc, t) => ({ ...acc, [t.key]: appointments.filter((a) => tabOf(a) === t.key).length }), {});
  const visible = appointments
    .filter((a) => tabOf(a) === tab)
    .sort((a, b) => (tab === 'upcoming'
      ? new Date(a.appointmentDate) - new Date(b.appointmentDate)
      : new Date(b.appointmentDate) - new Date(a.appointmentDate)));

  return (
    <div className="page-wide" style={{ maxWidth: 820 }}>
      <div className="page-head">
        <h2>My appointments</h2>
        <p>Track your visits and cancel if your plans change.</p>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key}
            className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}<span className="count">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {loading && <p className="muted">Loading your appointments…</p>}

      {!loading && visible.length === 0 && (
        <EmptyState
          title={tab === 'upcoming' ? 'No upcoming appointments' : tab === 'past' ? 'No past appointments' : 'No cancelled appointments'}
          text={tab === 'upcoming' ? 'Find a doctor and book your first visit in under a minute.' : undefined}
          action={tab === 'upcoming' && <Link to="/doctors" className="btn-primary">Find a doctor</Link>}
        />
      )}

      {visible.map((a) => {
        const d = new Date(a.appointmentDate);
        const canCancel = a.status === 'PENDING' || a.status === 'CONFIRMED';
        return (
          <article className="acard" key={a._id}>
            <div className="datebox" aria-hidden="true">
              <div className="m">{d.toLocaleDateString(undefined, { month: 'short' })}</div>
              <div className="d">{d.getDate()}</div>
            </div>
            <div>
              <h3>{a.doctor?.name || 'Doctor no longer listed'}</h3>
              <p className="sub">{a.doctor?.specialty}</p>
              <p className="time">{d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · {a.timeSlot}</p>
              {a.reason && <p className="why">Reason: {a.reason}</p>}
            </div>
            <div className="acard-side">
              <span className={`status status-${a.status.toLowerCase()}`} style={{ textTransform: 'none' }}>
                {STATUS_TEXT[a.status] || a.status}
              </span>
              {canCancel && (
                <button className="btn-outline btn-small" onClick={() => setToCancel(a)}>Cancel appointment</button>
              )}
            </div>
          </article>
        );
      })}

      <ConfirmDialog
        open={!!toCancel}
        danger
        title="Cancel this appointment?"
        message={toCancel ? `Your visit with ${toCancel.doctor?.name || 'the doctor'} at ${toCancel.timeSlot} will be cancelled and the time will open up for others.` : ''}
        confirmLabel="Yes, cancel it"
        cancelLabel="Keep appointment"
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      />
    </div>
  );
}
