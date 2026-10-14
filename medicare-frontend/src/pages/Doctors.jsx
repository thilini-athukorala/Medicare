import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { formatDate, futureDates } from './Booking';
import { Avatar, EmptyState, SkeletonCards } from '../components/ui';

const QUICK_SPECIALTIES = ['Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'Neurology', 'General Physician'];
const EMPTY = { name: '', specialty: '', hospital: '', date: '' };

export default function Doctors() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({ ...EMPTY, specialty: state?.specialty || '' });
  const [sort, setSort] = useState('name');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load the full list once; searching and filtering happen instantly in the browser
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/doctors');
      setDoctors(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load doctors. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));
  const pickSpecialty = (s) => setFilters((f) => ({ ...f, specialty: f.specialty === s ? '' : s }));
  const hasFilters = Object.values(filters).some(Boolean);

  const specialties = useMemo(
    () => [...new Set([...QUICK_SPECIALTIES, ...doctors.map((d) => d.specialty)].filter(Boolean))].sort(),
    [doctors]
  );
  const hospitals = useMemo(() => [...new Set(doctors.map((d) => d.hospital).filter(Boolean))].sort(), [doctors]);

  const results = useMemo(() => {
    const q = filters.name.trim().toLowerCase();
    const list = doctors.filter((d) => {
      if (q && !d.name.toLowerCase().includes(q)) return false;
      if (filters.specialty && !d.specialty.toLowerCase().includes(filters.specialty.toLowerCase())) return false;
      if (filters.hospital && d.hospital !== filters.hospital) return false;
      if (filters.date && !futureDates(d).includes(filters.date)) return false;
      return true;
    });
    const nextOf = (d) => futureDates(d)[0] || '9999-99-99';
    return [...list].sort((a, b) => {
      if (sort === 'fee') return a.consultationFee - b.consultationFee;
      if (sort === 'experience') return b.experienceYears - a.experienceYears;
      if (sort === 'soonest') return nextOf(a).localeCompare(nextOf(b));
      return a.name.localeCompare(b.name);
    });
  }, [doctors, filters, sort]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="page-wide">
      <div className="page-head">
        <h2>Find a doctor</h2>
        <p>Search by name, specialty, hospital or the date you want to visit.</p>
      </div>

      <div className="finder">
        <div className="finder-grid">
          <div>
            <label htmlFor="f-name">Doctor name</label>
            <input id="f-name" type="search" placeholder="Search doctor name" value={filters.name} onChange={set('name')} />
          </div>
          <div>
            <label htmlFor="f-spec">Specialty</label>
            <select id="f-spec" value={filters.specialty} onChange={set('specialty')}>
              <option value="">All specialties</option>
              {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-hosp">Hospital</label>
            <select id="f-hosp" value={filters.hospital} onChange={set('hospital')}>
              <option value="">All hospitals</option>
              {hospitals.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-date">Available on</label>
            <input id="f-date" type="date" min={today} value={filters.date} onChange={set('date')} />
          </div>
          <div className="finder-actions">
            {hasFilters && (
              <button type="button" className="btn-ghost-light" onClick={() => setFilters(EMPTY)}>Clear all</button>
            )}
          </div>
        </div>
        <div className="chip-row" role="group" aria-label="Quick specialty filters">
          {QUICK_SPECIALTIES.map((s) => (
            <button key={s} type="button" className={`chip ${filters.specialty === s ? 'active' : ''}`} onClick={() => pickSpecialty(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="error" style={{ marginBottom: 16 }}>
          {error} <button className="btn-small" style={{ marginLeft: 8 }} onClick={load}>Try again</button>
        </div>
      )}

      {loading ? (
        <SkeletonCards />
      ) : (
        <>
          {!error && doctors.length > 0 && (
            <div className="result-bar">
              <span>{results.length} {results.length === 1 ? 'doctor' : 'doctors'} found</span>
              <label>
                Sort by{' '}
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="name">Name</option>
                  <option value="soonest">Soonest available</option>
                  <option value="fee">Lowest fee</option>
                  <option value="experience">Most experience</option>
                </select>
              </label>
            </div>
          )}

          {!error && results.length === 0 && (
            <EmptyState
              title="No doctors match your search"
              text={hasFilters ? 'Try removing a filter or choosing a different date.' : 'No doctors have been added yet.'}
              action={hasFilters && <button onClick={() => setFilters(EMPTY)}>Clear all filters</button>}
            />
          )}

          <div className="doctor-list">
            {results.map((doc) => {
              const next = futureDates(doc)[0];
              return (
                <article className="dcard" key={doc._id}>
                  <Avatar name={doc.name} />
                  <div>
                    <h3>{doc.name}</h3>
                    <p className="dspec">{doc.specialty}</p>
                    <div className="dmeta">
                      {doc.hospital && <span>{doc.hospital}</span>}
                      {doc.qualification && <span>{doc.qualification}</span>}
                      <span>{doc.experienceYears} yrs experience</span>
                    </div>
                    <p className={`dnext ${next ? 'ok' : 'none'}`}>
                      {next ? `Next available: ${formatDate(next)}` : 'No dates open yet'}
                    </p>
                  </div>
                  <div className="dcard-side">
                    <div className="dfee"><small>Consultation fee</small>Rs. {doc.consultationFee}</div>
                    <button
                      disabled={!next}
                      onClick={() => navigate(`/book/${doc._id}`, { state: { doctor: doc } })}
                    >
                      {next ? 'Book appointment' : 'Not available'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
