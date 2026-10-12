import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const SPECIALTIES = ['Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'Neurology', 'General Physician'];

const TILES_PATIENT = [
  { to: '/doctors', label: 'Find a Doctor', sub: 'Browse by specialty', icon: 'search' },
  { to: '/doctors', label: 'Book Appointment', sub: 'Pick a time that works', icon: 'calendar' },
  { to: '/my-appointments', label: 'My Appointments', sub: 'Track every visit', icon: 'clipboard' },
  { to: '/doctors', label: 'All Specialties', sub: 'See every department', icon: 'grid' }
];

const TILES_DOCTOR = [
  { to: '/doctor/appointments', label: 'My Appointments', sub: 'Confirm, cancel or move visits', icon: 'clipboard' },
  { to: '/doctor/availability', label: 'My Availability', sub: 'Set the dates you can see patients', icon: 'calendar' }
];

const TILES_ADMIN = [
  { to: '/admin/appointments', label: 'All Appointments', sub: 'Confirm and complete visits', icon: 'clipboard' },
  { to: '/admin/doctors', label: 'Manage Doctors', sub: 'Add, edit or remove doctors', icon: 'grid' }
];

function TileIcon({ name }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
    clipboard: <><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1M9 11h6M9 15h4" /></>,
    grid: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></>,
    bell: <><path d="M6 10a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" /><path d="M10 20a2 2 0 004 0" /></>
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const tiles = { PATIENT: TILES_PATIENT, DOCTOR: TILES_DOCTOR, ADMIN: TILES_ADMIN }[user.role];

  useEffect(() => {
    api.get('/stats').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  return (
    <div>
      <section className="banner">
        <div className="banner-pattern" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <svg key={i} viewBox="0 0 100 100" className="hex">
              <polygon points="50,3 93,25 93,75 50,97 7,75 7,25" />
            </svg>
          ))}
        </div>
        <div className="banner-copy">
          <span className="banner-eyebrow">MediCare Appointment System</span>
          <h1>
            {`Welcome back, ${user.role === 'DOCTOR' ? user.name : user.name.split(' ')[0]}.`}
          </h1>
          <p>
            {{
              PATIENT: 'Find the right doctor and book your visit in under a minute.',
              DOCTOR: 'Keep your available dates up to date and look after your appointments.',
              ADMIN: 'Manage your doctors and keep every appointment on track.'
            }[user.role]}
          </p>
        </div>
      </section>

      {user.role === 'PATIENT' && (
        <section className="search-card-wrap">
          <SpecialtyFinder />
        </section>
      )}

      <section className={`tile-grid ${user.role === 'PATIENT' ? '' : 'tile-grid-compact'}`}>
        {tiles.map((t) => (
          <Link to={t.to} key={t.label} className="tile">
            <span className="tile-icon"><TileIcon name={t.icon} /></span>
            <span className="tile-label">{t.label}</span>
            <span className="tile-sub">{t.sub}</span>
          </Link>
        ))}
      </section>

      {stats && (
        <section className="stats-bar">
          <div className="stat"><span className="stat-num">{stats.doctors}</span><span className="stat-label">Doctors on the platform</span></div>
          <div className="stat"><span className="stat-num">{stats.patients}</span><span className="stat-label">Registered patients</span></div>
          <div className="stat"><span className="stat-num">{stats.appointments}</span><span className="stat-label">Appointments booked</span></div>
        </section>
      )}

      <footer className="footer">
        <span className="brand">MediCare</span>
        <span>EE4207 Web Application Development · Academic Project</span>
      </footer>
    </div>
  );
}

function SpecialtyFinder() {
  return (
    <div className="search-card">
      <h2>Find a Doctor</h2>
      <div className="search-card-grid">
        {SPECIALTIES.map((s) => (
          <Link key={s} to="/doctors" state={{ specialty: s }} className="search-item">
            {s}
          </Link>
        ))}
      </div>
      <Link to="/doctors" className="btn-primary search-cta">Browse all doctors</Link>
    </div>
  );
}
