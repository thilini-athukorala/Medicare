import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { formatDate, futureDates } from './Booking';

export default function Doctors() {
  const { state } = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [specialty, setSpecialty] = useState(state?.specialty || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDoctors = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/doctors', { params: query ? { specialty: query } : {} });
      setDoctors(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(state?.specialty || ''); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(specialty);
  };

  return (
    <div className="page">
      <h2>Find a Doctor</h2>
      <form className="search-row" onSubmit={handleSearch}>
        <input
          placeholder="Search by specialty (e.g. Cardiology)"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading doctors...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && doctors.length === 0 && <p>No doctors found.</p>}

      <div className="doctor-grid">
        {doctors.map((doc) => (
          <div className="doctor-card" key={doc._id}>
            <h3>{doc.name}</h3>
            <p className="specialty">{doc.specialty}</p>
            {doc.hospital && <p>{doc.hospital}</p>}
            <p>{doc.qualification || 'Qualification not listed'}</p>
            <p>{doc.experienceYears} years experience</p>
            <p className="fee">Fee: Rs. {doc.consultationFee}</p>
            <p className="next-date">
              {futureDates(doc)[0] ? `Next available: ${formatDate(futureDates(doc)[0])}` : 'No dates open yet'}
            </p>
            <button onClick={() => navigate(`/book/${doc._id}`, { state: { doctor: doc } })}>
              Book Appointment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
