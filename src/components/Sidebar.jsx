import { NavLink, useNavigate } from 'react-router-dom';

import '../styles/Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('adminToken');
    navigate('/login');
  }

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        Biker<span>X</span>
      </div>

      <div className="sidebar-menu">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/users">Users</NavLink>
        <NavLink to="/posts">Posts</NavLink>
        <NavLink to="/meetups">Meetups</NavLink>
        <NavLink to="/reports">Reports</NavLink>
      </div>

      <button className="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default Sidebar;