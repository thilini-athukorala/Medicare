
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import HeroSlider from '../components/HeroSlider';

const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'General Physician'
];

const TILES_PATIENT = [
  {
    to: '/doctors',
    label: 'Find a Doctor',
    sub: 'Browse by specialty',
    icon: 'search'
  },
  {
    to: '/doctors',
    label: 'Book Appointment',
    sub: 'Pick a time that works',
    icon: 'calendar'
  },
  {
    to: '/my-appointments',
    label: 'My Appointments',
    sub: 'Track every visit',
    icon: 'clipboard'
  },
  {
    to: '/doctors',
    label: 'All Specialties',
    sub: 'See every department',
    icon: 'grid'
  }
];

const TILES_DOCTOR = [
  {
    to: '/doctor/appointments',
    label: 'My Appointments',
    sub: 'Confirm, cancel or move visits',
    icon: 'clipboard'
  },
  {
    to: '/doctor/availability',
    label: 'My Availability',
    sub: 'Set the dates you can see patients',
    icon: 'calendar'
  }
];

const TILES_ADMIN = [
  {
    to: '/admin/appointments',
    label: 'All Appointments',
    sub: 'Confirm and complete visits',
    icon: 'clipboard'
  },
  {
    to: '/admin/doctors',
    label: 'Manage Doctors',
    sub: 'Add, edit or remove doctors',
    icon: 'grid'
  }
];

function TileIcon({ name }) {
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
    clipboard: (
      <>
        <rect x="6" y="4" width="12" height="17" rx="2" />
        <path d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1M9 11h6M9 15h4" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" />
      </>
    )
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function Home() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);

  const role = String(user?.role ?? '').toUpperCase();

  const tiles = {
    PATIENT: TILES_PATIENT,
    DOCTOR: TILES_DOCTOR,
    ADMIN: TILES_ADMIN
  }[role] ?? [];

  useEffect(() => {
    api.get('/stats')
      .then(({ data }) => {
        setStats(data);
      })
      .catch((error) => {
        console.error('Failed to load statistics:', error);
      });
  }, []);

  return (
    <div>
      {/* Hero Image Slider */}
      <HeroSlider />

      {/* Patient Search Section */}
      {role === 'PATIENT' && (
        <section className="search-card-wrap">
          <SpecialtyFinder />
        </section>
      )}

      {/* Dashboard Navigation Tiles */}
      <section
        className={`tile-grid ${
          role === 'PATIENT' ? '' : 'tile-grid-compact'
        }`}
      >
        {tiles.map((tile) => (
          <Link
            to={tile.to}
            key={tile.label}
            className="tile"
          >
            <span className="tile-icon">
              <TileIcon name={tile.icon} />
            </span>

            <span className="tile-label">
              {tile.label}
            </span>

            <span className="tile-sub">
              {tile.sub}
            </span>
          </Link>
        ))}
      </section>

      {/* Platform Statistics */}
      {stats && (
        <section className="stats-bar">
          <div className="stat">
            <span className="stat-num">
              {stats.doctors}
            </span>
            <span className="stat-label">
              Doctors on the platform
            </span>
          </div>

          <div className="stat">
            <span className="stat-num">
              {stats.patients}
            </span>
            <span className="stat-label">
              Registered patients
            </span>
          </div>

          <div className="stat">
            <span className="stat-num">
              {stats.appointments}
            </span>
            <span className="stat-label">
              Appointments booked
            </span>
          </div>
        </section>
      )}

      {/* Footer without Module Code or Module Name */}
      <footer className="footer">
        <span className="brand">MediCare</span>
        <span>Connecting You to Better Healthcare.</span>
      </footer>
    </div>
  );
}

function SpecialtyFinder() {
  return (
    <div className="search-card">
      <h2>Find a Doctor</h2>

      <div className="search-card-grid">
        {SPECIALTIES.map((specialty) => (
          <Link
            key={specialty}
            to="/doctors"
            state={{ specialty }}
            className="search-item"
          >
            {specialty}
          </Link>
        ))}
      </div>

      <Link
        to="/doctors"
        className="btn-primary search-cta"
      >
        Browse all doctors
      </Link>
    </div>
  );
}
