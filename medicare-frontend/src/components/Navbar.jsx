import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const LINKS = {
    PATIENT: [
      { to: '/doctors', label: 'Find Doctors' },
      { to: '/my-appointments', label: 'My Appointments' }
    ],
    DOCTOR: [
      { to: '/doctor/appointments', label: 'My Appointments' },
      { to: '/doctor/availability', label: 'My Availability' }
    ],
    ADMIN: [
      { to: '/admin/doctors', label: 'Manage Doctors' },
      { to: '/admin/appointments', label: 'All Appointments' }
    ]
  };
  const links = LINKS[user?.role] || [];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <Link to="/" className="brand">
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7-4.35-9.5-8.5C.7 8.9 2.3 5 6 5c2 0 3.3 1.1 4 2.2C10.7 6.1 12 5 14 5c3.7 0 5.3 3.9 3.5 7.5C19 16.65 12 21 12 21z" />
              <path d="M9 12h2v-2h2v2h2v2h-2v2h-2v-2H9v-2z" />
            </svg>
          </span>
          MediCare
        </Link>

        <div className={`nav-links ${open ? 'nav-links-open' : ''}`}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-actions">
          <span className="user-pill">
            <span className="nav-avatar" aria-hidden="true">{(user?.name || '?').replace(/^dr\.?\s*/i, '').trim().charAt(0).toUpperCase()}</span>{' '}
            {user?.name} · {user?.role}
          </span>
          <button className="btn-logout" onClick={handleLogout}>Log out</button>
        </div>
      </div>
    </nav>
  );
}
