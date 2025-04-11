import React, { useEffect, useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from '../UserContext';
import {
  getTotalUsers,
  getTotalPackages,
  getActiveBookings,
  getRevenue,
  getBookingsTrend,
  getUserTypes,
  getPackageCategories,
  getTotalBookings
} from '../apiService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Admin = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPackages, setTotalPackages] = useState(0);
  const [activeBookings, setActiveBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [bookingsTrend, setBookingsTrend] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [packageCategories, setPackageCategories] = useState([]);

  useEffect(() => {
    if (!user || user.type !== 'ADMIN') {
      navigate('/login');
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        const users = await getTotalUsers();
        if (isMounted) setTotalUsers(users);

        const packages = await getTotalPackages();
        if (isMounted) setTotalPackages(packages);

        const bookings = await getActiveBookings();
        if (isMounted) setActiveBookings(bookings);

        const revenue = await getRevenue();
        if (isMounted) setTotalRevenue(revenue);

        const totalBookingsCount = await getTotalBookings();
        if (isMounted) setTotalBookings(totalBookingsCount);

        const trend = await getBookingsTrend();
        if (isMounted) setBookingsTrend(trend);

        const userTypesData = await getUserTypes();
        if (isMounted) setUserTypes(userTypesData);

        const categories = await getPackageCategories();
        if (isMounted) setPackageCategories(categories);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user, navigate]);

  const bookingsTrendChartData = {
    labels: bookingsTrend.map(item => item.month),
    datasets: [
      {
        label: 'Bookings Trend',
        data: bookingsTrend.map(item => item.count),
        fill: false,
        borderColor: '#00bcd4', // Cyan for the chart line
        tension: 0.1,
      },
    ],
  };

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

          <div className="row">
            <div className="col-md-3 mb-4">
              <div className="card shadow-sm metric-card">
                <div className="card-body">
                  <h5>Total Users</h5>
                  <p>{totalUsers}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="card shadow-sm metric-card">
                <div className="card-body">
                  <h5>Total Packages</h5>
                  <p>{totalPackages}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="card shadow-sm metric-card">
                <div className="card-body">
                  <h5>Active Bookings</h5>
                  <p>{activeBookings}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="card shadow-sm metric-card">
                <div className="card-body">
                  <h5>Total Bookings</h5>
                  <p>{totalBookings}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm chart-card">
                <div className="card-body">
                  <h5>Bookings Trend</h5>
                  <Line data={bookingsTrendChartData} />
                </div>
              </div>
            </div>
            {/* Other charts can be added here */}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
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

      <style jsx>{`
        .admin-dashboard {
          background-color: #f5f5f5; /* Light gray background */
          min-height: 100vh;
          color: #000000; /* Black text */
        }

        /* Sidebar */
        .sidebar {
          background-color: #000000; /* Black background */
          color: #ffffff; /* White text */
          padding: 20px;
          height: 100vh;
          position: sticky;
          top: 0;
        }
        .sidebar h4 {
          color: #ffffff; /* White title */
          margin-bottom: 30px;
        }
        .nav-link {
          color: #cccccc !important; /* Light gray for sidebar links */
          font-weight: 500;
          padding: 10px 15px;
          transition: color 0.3s ease;
        }
        .nav-link:hover,
        .nav-link.active {
          color: #00bcd4 !important; /* Cyan on hover/active */
          background-color: #333333; /* Dark gray background on hover */
          border-radius: 5px;
        }
        .btn-link {
          color: #cccccc !important; /* Light gray for Sign Out button */
          font-weight: 500;
          padding: 10px 15px;
          transition: color 0.3s ease;
        }
        .btn-link:hover {
          color: #00bcd4 !important; /* Cyan on hover */
          background-color: #333333; /* Dark gray background on hover */
          border-radius: 5px;
        }

        /* Main Content */
        .main-content {
          padding: 20px;
        }

        /* Top Navbar */
        .top-navbar {
          background-color: #ffffff; /* White background */
          border-bottom: 1px solid #999999; /* Medium gray border */
          margin-bottom: 20px;
        }
        .search-bar {
          background-color: #f0f0f0; /* Light gray background */
          border: 1px solid #999999; /* Medium gray border */
          color: #000000; /* Black text */
        }
        .search-bar::placeholder {
          color: #666666; /* Medium gray placeholder */
        }
        .notifications {
          color: #666666; /* Medium gray text */
        }
        .profile-avatar {
          background-color: #00bcd4; /* Cyan background */
          color: #ffffff; /* White text */
          font-weight: bold;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Metric Cards */
        .metric-card {
          background-color: #ffffff; /* White background */
          border: 1px solid #999999; /* Medium gray border */
          border-radius: 8px;
          transition: transform 0.2s ease;
        }
        .metric-card:hover {
          transform: translateY(-5px);
        }
        .metric-card h5 {
          color: #000000; /* Black text */
          font-size: 1.1rem;
          margin-bottom: 10px;
        }
        .metric-card p {
          color: #666666; /* Medium gray text */
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0;
        }

        /* Chart Card */
        .chart-card {
          background-color: #ffffff; /* White background */
          border: 1px solid #999999; /* Medium gray border */
          border-radius: 8px;
        }
        .chart-card h5 {
          color: #000000; /* Black text */
          font-size: 1.1rem;
          margin-bottom: 15px;
        }

        /* Modal */
        .modal-content {
          background-color: #ffffff; /* White background */
          color: #000000; /* Black text */
          border: 1px solid #999999; /* Medium gray border */
        }
        .modal-header {
          border-bottom: 1px solid #999999; /* Medium gray border */
        }
        .modal-title {
          color: #000000; /* Black text */
        }
        .btn-close {
          filter: invert(1); /* Make the close button white */
        }
        .modal-body {
          color: #666666; /* Medium gray text */
        }
        .modal-footer {
          border-top: 1px solid #999999; /* Medium gray border */
        }
        .btn-secondary {
          background-color: #666666; /* Medium gray background */
          border-color: #666666;
          color: #ffffff; /* White text */
        }
        .btn-secondary:hover {
          background-color: #555555; /* Darker gray on hover */
          border-color: #555555;
        }
        .btn-accent {
          background-color: #00bcd4; /* Cyan background */
          border-color: #00bcd4;
          color: #ffffff; /* White text */
        }
        .btn-accent:hover {
          background-color: #00a4b7; /* Darker cyan on hover */
          border-color: #00a4b7;
        }
      `}</style>
    </div>
  );
};

export default Admin;