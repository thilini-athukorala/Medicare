import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Avatar, useToast } from '../components/ui';

// NOTE: these two helpers are imported by other pages – keep the names and behaviour.
export const formatDate = (key) =>
  new Date(`${key}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

export const futureDates = (doctor) => {
  const today = new Date().toISOString().slice(0, 10);
  return [...new Set((doctor?.availability || []).map((a) => a.date))].filter((d) => d >= today).sort();
};

const parts = (key) => {
  const d = new Date(`${key}T00:00:00`);
  return {
    dow: d.toLocaleDateString(undefined, { weekday: 'short' }),
    day: d.getDate(),
    mon: d.toLocaleDateString(undefined, { month: 'short' })
  };
};

const MAX_REASON = 300;

export default function Booking() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();

  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/doctors/${doctorId}`)
      .then(({ data }) => setDoctor(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load doctor'));
  }, [doctorId]);

  useEffect(() => {
    setTimeSlot('');
    setSlots([]);
    if (!date) return;
    setSlotsLoading(true);
    api.get(`/doctors/${doctorId}/slots`, { params: { date } })
      .then(({ data }) => setSlots(data.slots))
      .catch((err) => setError(err.response?.data?.message || 'Could not load time slots'))
      .finally(() => setSlotsLoading(false));
  }, [date, doctorId]);

  const dates = futureDates(doctor);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/appointments', { doctorId, appointmentDate: date, timeSlot, reason });
      notify('Appointment booked. You can track it under My Appointments.');
      navigate('/my-appointments');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not book appointment');
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wide">
      <Link to="/doctors" className="back-link">← Back to doctors</Link>
      <div className="page-head">
        <h2>Book an appointment</h2>
        <p>Choose a date and time. Your booking is confirmed by the doctor's office.</p>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      {!doctor && !error && <p className="muted">Loading doctor details…</p>}

      {doctor && dates.length === 0 && (
        <p className="notice">This doctor has not opened any dates yet. Please check back later or <Link to="/doctors">choose another doctor</Link>.</p>
      )}

      {doctor && dates.length > 0 && (
        <form className="booking-layout" onSubmit={handleSubmit}>
          <div>
            <section className="panel">
              <h3><span className="step-badge">1</span>Choose a date</h3>
              <p className="hint">Only dates when {doctor.name} is available are shown.</p>
              <div className="date-scroller" role="radiogroup" aria-label="Available dates">
                {dates.map((d) => {
                  const p = parts(d);
                  return (
                    <button
                      type="button" key={d} role="radio" aria-checked={date === d}
                      className={`date-pill ${date === d ? 'selected' : ''}`}
                      onClick={() => setDate(d)}
                    >
                      <span className="dow">{p.dow}</span>
                      <span className="dnum">{p.day}</span>
                      <span className="dmon">{p.mon}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="panel">
              <h3><span className="step-badge">2</span>Choose a time</h3>
              {!date && <p className="hint">Pick a date first to see free times.</p>}
              {date && slotsLoading && <p className="hint">Loading times…</p>}
              {date && !slotsLoading && slots.length === 0 && (
                <p className="hint">No free times on this date. Try another day.</p>
              )}
              <div className="slot-grid" role="radiogroup" aria-label="Available times">
                {slots.map((s) => (
                  <button
                    type="button" key={s} role="radio" aria-checked={timeSlot === s}
                    className={`slot-btn ${timeSlot === s ? 'selected' : ''}`}
                    onClick={() => setTimeSlot(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            <section className="panel">
              <h3><span className="step-badge">3</span>Reason for visit <span className="muted">(optional)</span></h3>
              <p className="hint">A short note helps the doctor prepare.</p>
              <textarea
                value={reason} rows={3} maxLength={MAX_REASON}
                onChange={(e) => setReason(e.target.value)}
                placeholder="For example: chest pain when climbing stairs"
                aria-label="Reason for visit"
              />
              <div className="char-count">{reason.length}/{MAX_REASON}</div>
            </section>
          </div>

          <aside className="panel summary" aria-label="Booking summary">
            <div className="summary-doctor">
              <Avatar name={doctor.name} />
              <div>
                <h3>{doctor.name}</h3>
                <p>{doctor.specialty}</p>
              </div>
            </div>
            <dl>
              {doctor.hospital && (<><dt>Hospital</dt><dd>{doctor.hospital}</dd></>)}
              <dt>Date</dt>
              <dd className={date ? '' : 'placeholder'}>{date ? formatDate(date) : 'Not chosen'}</dd>
              <dt>Time</dt>
              <dd className={timeSlot ? '' : 'placeholder'}>{timeSlot || 'Not chosen'}</dd>
              <dt>Fee</dt>
              <dd>Rs. {doctor.consultationFee}</dd>
            </dl>
            <button type="submit" className="btn-block" disabled={!timeSlot || submitting}>
              {submitting && <span className="btn-spinner" />}
              {submitting ? 'Booking…' : 'Confirm booking'}
            </button>
            {!timeSlot && <p className="field-hint" style={{ textAlign: 'center' }}>Choose a date and time to continue.</p>}
          </aside>
        </form>
      )}
    </div>
  );
}
