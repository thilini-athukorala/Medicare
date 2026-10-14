
import { Link } from 'react-router-dom';

const Check = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.7 2.7L16 9.8" />
  </svg>
);

const HeartLogo = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M24 41S6 30.5 6 17.5C6 11.7 10.5 7 16.2 7c3.3 0 6.2 1.6 7.8 4.2C25.6 8.6 28.5 7 31.8 7 37.5 7 42 11.7 42 17.5 42 30.5 24 41Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path
      d="M13 24h7l3-6 4 12 3-6h5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function AuthShell({ children }) {
  return (
    <div className="auth-wrap">
      <aside className="auth-side">
        <div className="auth-content">

          <Link to="/login" className="auth-brand">
            <span className="auth-brand-icon">
              <HeartLogo />
            </span>
            <span>MediCare</span>
          </Link>

          <div className="auth-tagline">
            YOUR HEALTH, OUR PRIORITY
          </div>

          <h1>
            Connecting You to
            <span className="auth-highlight"> Better Healthcare.</span>
          </h1>

          <p className="auth-description">
            Discover medical specialists, schedule appointments
            effortlessly, and manage your healthcare journey
            with confidence.
          </p>

          <ul className="auth-points">
            <li>
              <Check />
              <span>Find the Right Specialist</span>
            </li>
            <li>
              <Check />
              <span>Book Appointments with Ease</span>
            </li>
            <li>
              <Check />
              <span>Manage Your Visits Anytime</span>
            </li>
          </ul>

          <div className="auth-bottom-note">
            MediCare · Online Medical Appointment System
          </div>

        </div>
      </aside>

      <main className="auth-main">
        {children}
      </main>
    </div>
  );
}
