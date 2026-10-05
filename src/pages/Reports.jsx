import { useEffect, useState } from 'react';

import Sidebar from '../components/Sidebar';
import { API_URL } from '../services/api';
import { handleUnauthorized } from '../services/auth';

import '../styles/Reports.css';

function Reports() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    getReports();
  }, []);

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

      if (!response.ok) {
        setError('Could not load reports.');
        return;
      }

      setReports(data);
    }
    catch (error) {
      console.log(error);
      setError('Could not connect to the server.');
    }
  }

  async function updateStatus(reportId, status) {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(
        `${API_URL}/Admin/reports/${reportId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Could not update report.');
        return;
      }

      setReports(
        reports.map(report =>
          report.reportId === reportId
            ? { ...report, status }
            : report
        )
      );
    }
    catch (error) {
      console.log(error);
      setError('Could not connect to the server.');
    }
  }
  async function deleteComment(commentId, reportId) {
  try {
    const token = localStorage.getItem('adminToken');

    const response = await fetch(
      `${API_URL}/Admin/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (handleUnauthorized(response)) return;

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || 'Could not delete comment.');
      return;
    }

    await updateStatus(reportId, 'Resolved');
  }
  catch (error) {
    console.log(error);
    setError('Could not connect to the server.');
  }
}

  const filteredReports = reports.filter(report => {
    if (filter === 'All') return true;

    return report.status === filter;
  });

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="reports-content">
        <div className="reports-header">
          <div>
            <h1>Reports</h1>
            <p>Review reported content</p>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Reports</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {error && <p className="reports-error">{error}</p>}

        <div className="reports-list">
          {filteredReports.map(report => (
            <div className="report-item" key={report.reportId}>

              <div className="report-top">
                <div>
                  <h3>{report.reason}</h3>

                  <p className="report-type">
                  {report.commentId
                  ? 'Reported Comment'
                  : report.postId
                  ? 'Reported Post'
                  : 'Reported Meetup'}
                  </p>
                </div>

                <span
                  className={`report-status ${report.status.toLowerCase()}`}
                >
                  {report.status}
                </span>
              </div>

              {report.description && (
                <p className="report-description">
                  {report.description}
                </p>
              )}

              <div className="report-info">
                <span>Report ID: {report.reportId}</span>
                <span>User ID: {report.userId}</span>

                {report.postId && (
                  <span>Post ID: {report.postId}</span>
                )}

                {report.meetupId && (
                  <span>Meetup ID: {report.meetupId}</span>
                )}

                {report.commentId && (
                  <span>Comment ID: {report.commentId}</span>
                )}

                <span>
                  {new Date(report.createdAt).toLocaleString()}
                </span>
              </div>

              {report.status === 'Pending' && (
                <div className="report-actions">
                  {report.commentId && (
  <button
    className="delete-button"
    onClick={() =>
      deleteComment(report.commentId, report.reportId)
    }
  >
    Delete Comment
  </button>
)}
                  <button
                    className="resolve-button"
                    onClick={() => updateStatus(report.reportId, 'Resolved')}
                  >
                    Resolve
                  </button>

                  <button
                    className="reject-button"
                    onClick={() => updateStatus(report.reportId, 'Rejected')}
                  >
                    Reject
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Reports;