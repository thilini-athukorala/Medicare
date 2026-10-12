import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Booking from './pages/Booking';
import MyAppointments from './pages/MyAppointments';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorAvailability from './pages/DoctorAvailability';
import AdminDoctors from './pages/AdminDoctors';
import AdminAppointments from './pages/AdminAppointments';

function Layout({ children }) {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

        {/* Patient pages */}
        <Route path="/doctors" element={<ProtectedRoute roles={['PATIENT']}><Doctors /></ProtectedRoute>} />
        <Route path="/book/:doctorId" element={<ProtectedRoute roles={['PATIENT']}><Booking /></ProtectedRoute>} />
        <Route path="/my-appointments" element={<ProtectedRoute roles={['PATIENT']}><MyAppointments /></ProtectedRoute>} />

        {/* Doctor pages */}
        <Route path="/doctor/appointments" element={<ProtectedRoute roles={['DOCTOR']}><DoctorAppointments /></ProtectedRoute>} />
        <Route path="/doctor/availability" element={<ProtectedRoute roles={['DOCTOR']}><DoctorAvailability /></ProtectedRoute>} />

        {/* Admin pages */}
        <Route path="/admin/doctors" element={<ProtectedRoute roles={['ADMIN']}><AdminDoctors /></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute roles={['ADMIN']}><AdminAppointments /></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}
