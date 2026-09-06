import { useEffect, useState } from 'react';

import Sidebar from '../components/Sidebar';
import { API_URL } from '../services/api';
import { handleUnauthorized } from '../services/auth';

import '../styles/Meetups.css';

function Meetups() {
  const [meetups, setMeetups] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getMeetups();
  }, []);

  async function getMeetups() {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/Admin/meetups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setError('Could not load meetups.');
        return;
      }

      setMeetups(data);
    }
    catch (error) {
      console.log(error);
      setError('Could not connect to the server.');
    }
  }

  async function deleteMeetup(meetupId) {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this meetup?'
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/Admin/meetups/${meetupId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Could not delete meetup.');
        return;
      }

      setMeetups(
        meetups.filter(meetup => meetup.meetupId !== meetupId)
      );
    }
    catch (error) {
      console.log(error);
      setError('Could not connect to the server.');
    }
  }

  const filteredMeetups = meetups.filter(meetup => {
    const value = search.toLowerCase();

    return (
      meetup.title?.toLowerCase().includes(value) ||
      meetup.address?.toLowerCase().includes(value) ||
      meetup.status?.toLowerCase().includes(value)
    );
  });

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="meetups-content">
        <div className="meetups-header">
          <div>
            <h1>Meetups</h1>
            <p>Manage BikerX meetups</p>
          </div>

          <input
            type="text"
            placeholder="Search by title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <p className="meetups-error">{error}</p>}

        <div className="meetups-table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredMeetups.map(meetup => (
                <tr key={meetup.meetupId}>
                  <td className="meetup-title">{meetup.title}</td>

                  <td>
                    {new Date(meetup.date).toLocaleDateString()}
                  </td>

                  <td>{meetup.address}</td>

                  <td>
                    <span className="meetup-status">
                      {meetup.status}
                    </span>
                  </td>

                  <td>
                    {new Date(meetup.createdAt).toLocaleDateString()}
                  </td>

                  <td>
                    <button
                      className="delete-meetup-button"
                      onClick={() => deleteMeetup(meetup.meetupId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Meetups;