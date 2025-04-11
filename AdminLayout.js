// AdminLayout.js (updated)
import React, { useState, useContext, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../UserContext';
import './AdminLayout.css'; // Import the CSS file

const AdminLayout = ({ children }) => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    console.log('AdminLayout: User state:', user);
  }, [user]);

  const handleSignOut = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setTimeout(() => {
      setUser(null);
      localStorage.removeItem('token');
      navigate('/login');
    }, 0);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const userInitial = user && user.name ? user.name.charAt(0) : 'A';

  if (!user || user.type !== 'ADMIN') {
    console.log('AdminLayout: Redirecting to /login, user:', user);
    navigate('/login');
    return null;
  }

  return (
    <div className="container-fluid admin-dashboard">
      <div className="row">
        <div className="col-md-3">
          <div className="sidebar">
            <h4 className="text-center">Admin Dashboard</h4>
            <ul className="nav flex-column">
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/dashboard">Dashboard</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/users">Users</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/packages">Packages</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/bookings">Bookings</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/reports">Message</NavLink>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={handleSignOut}>Sign Out</button>
              </li>
            </ul>
          </div>
        </div>

        <div className="col-md-9 main-content">
          <div className="top-navbar d-flex justify-content-between align-items-center py-3">
            <input type="text" className="form-control w-50 search-bar" placeholder="Search..." />
            <div className="d-flex align-items-center">
              <span className="me-3 notifications">Notifications</span>
              <div className="profile-avatar rounded-circle text-white p-2">
                {userInitial}
              </div>
            </div>
          </div>

          {console.log('AdminLayout: Rendering children:', children)}
          {children || <div>No content to display</div>}
        </div>
      </div>

      {showLogoutModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Sign Out</h5>
                <button type="button" className="btn-close btn-close-white" onClick={cancelLogout}></button>
              </div>
              <div className="modal-body">
                <p>Do you want to sign out?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cancelLogout}>No</button>
                <button type="button" className="btn btn-accent" onClick={confirmLogout}>Yes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;