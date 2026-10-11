import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import { API_URL } from '../services/api';
import { handleUnauthorized } from '../services/auth';

import '../styles/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard();
    getReports();
  }, []);

  async function getDashboard() {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/Admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setError('Could not load dashboard.');
        return;
      }

      setDashboard(data);
    }
    catch (error) {
      console.log(error);
      setError('Could not connect to the server.');
    }
  }

  async function getReports() {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/Admin/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (response.ok) {
        setReports(data);
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  const totalReports = reports.length;

  const pendingReports = reports.filter(
    report => report.status === 'Pending'
  ).length;

  const resolvedReports = reports.filter(
    report => report.status === 'Resolved'
  ).length;

  const rejectedReports = reports.filter(
    report => report.status === 'Rejected'
  ).length;

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="dashboard-content">

        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome to BikerX Admin Panel</p>
        </div>

        {error && <p className="dashboard-error">{error}</p>}

        {dashboard && (
          <div className="dashboard-cards">

            <div className="dashboard-card">
              <p>Total Users</p>
              <h2>{dashboard.totalUsers}</h2>
            </div>

            <div className="dashboard-card">
              <p>Total Posts</p>
              <h2>{dashboard.totalPosts}</h2>
            </div>

            <div className="dashboard-card">
              <p>Total Meetups</p>
              <h2>{dashboard.totalMeetups}</h2>
            </div>

            <div className="dashboard-card">
              <p>Total Reports</p>
              <h2>{totalReports}</h2>
            </div>

          </div>
        )}

        <div className="dashboard-sections">

          <div className="dashboard-section">
            <h2>Reports Overview</h2>

            <div className="report-overview">
              <div>
                <span>Pending</span>
                <strong>{pendingReports}</strong>
              </div>

              <div>
                <span>Resolved</span>
                <strong>{resolvedReports}</strong>
              </div>

              <div>
                <span>Rejected</span>
                <strong>{rejectedReports}</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <h2>Quick Actions</h2>

            <div className="quick-actions">
              <button onClick={() => navigate('/users')}>
                Manage Users
              </button>

              <button onClick={() => navigate('/posts')}>
                Manage Posts
              </button>

              <button onClick={() => navigate('/meetups')}>
                Manage Meetups
              </button>

              <button onClick={() => navigate('/reports')}>
                Review Reports
              </button>

              <button onClick={() => navigate('/bike-models')}>
                Manage 3D Bikes
              </button>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

export default Dashboard;