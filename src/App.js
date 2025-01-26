import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import EventList from './components/EventList';
import CreateEvent from './components/CreateEvent';
import EventDetail from './components/EventDetail';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import { EventProvider } from './context/EventContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AuthLayout />}>
              <Route index element={<SignIn />} />
              <Route path="signup" element={<SignUp />} />
            </Route>
            <Route path="/events" element={<PrivateLayout />}>
              <Route index element={<EventList />} />
              <Route path="create" element={<CreateEvent />} />
              <Route path=":eventId" element={<EventDetail />} />
            </Route>
          </Routes>
        </Router>
      </EventProvider>
    </AuthProvider>
  );
}

// Layout for auth pages (sign in/sign up)
function AuthLayout() {
  const { user } = useAuth();
  
  // Redirect to events if already logged in
  if (user) {
    return <Navigate to="/events" replace />;
  }

  return <Outlet />;
}

// Layout for authenticated pages
function PrivateLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
}

export default App; 