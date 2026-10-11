import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Posts from './pages/Posts';
import Meetups from './pages/Meetups';
import Reports from './pages/Reports';
import BikeModels from './pages/BikeModels';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('adminToken');

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

function HomeRedirect() {
  const token = localStorage.getItem('adminToken');

  return (
    <Navigate
      to={token ? '/dashboard' : '/login'}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />

        <Route
          path="/users"
          element={<ProtectedRoute><Users /></ProtectedRoute>}
        />

        <Route
          path="/posts"
          element={<ProtectedRoute><Posts /></ProtectedRoute>}
        />

        <Route
          path="/meetups"
          element={<ProtectedRoute><Meetups /></ProtectedRoute>}
        />

        <Route
          path="/reports"
          element={<ProtectedRoute><Reports /></ProtectedRoute>}
        />

        <Route
         path="/bike-models"
         element={<ProtectedRoute><BikeModels /></ProtectedRoute>}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

