import { useEffect, useState } from 'react';

import Sidebar from '../components/Sidebar';
import { API_URL } from '../services/api';
import { handleUnauthorized } from '../services/auth';

import '../styles/Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getUsers();
  }, []);

  async function getUsers() {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/Admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setError('Could not load users.');
        return;
      }

      setUsers(data);
    }
    catch (error) {
      console.log(error);
      setError('Could not connect to the server.');
    }
  }

  async function deleteUser(userId) {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this user?'
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/Admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Could not delete user.');
        return;
      }

      setUsers(users.filter(user => user.userId !== userId));
    }
    catch (error) {
      console.log(error);
      setError('Could not connect to the server.');
    }
  }

  const filteredUsers = users.filter(user => {
    const value = search.toLowerCase();

    return (
      user.username.toLowerCase().includes(value) ||
      user.fullName.toLowerCase().includes(value) ||
      user.email.toLowerCase().includes(value)
    );
  });

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="users-content">
        <div className="users-header">
          <div>
            <h1>Users</h1>
            <p>Manage BikerX users</p>
          </div>

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <p className="users-error">{error}</p>}

        <div className="users-table-container">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Provider</th>
                <th>Verified</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.userId}>
                  <td className="username">@{user.username}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.authProvider}</td>
                  <td>{user.isEmailVerified ? 'Yes' : 'No'}</td>
                  <td>
                    <button
                      className="delete-user-button"
                      onClick={() => deleteUser(user.userId)}
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

export default Users;