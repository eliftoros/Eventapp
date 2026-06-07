import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import EventManagement from './pages/EventManagement';
import JoinedEvents from './pages/JoinedEvents';
import { useAuth } from './context/AuthContext';

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="dashboard" element={
          <PrivateRoute allowedRoles={['ORGANIZER']}>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="events" element={
          <PrivateRoute allowedRoles={['ORGANIZER']}>
            <EventManagement />
          </PrivateRoute>
        } />
        <Route path="joined-events" element={
          <PrivateRoute allowedRoles={['USER']}>
            <JoinedEvents />
          </PrivateRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;
