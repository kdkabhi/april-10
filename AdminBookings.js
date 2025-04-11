import React, { useEffect, useState, useContext } from 'react';
import { getAllBookingsGroupedByPackage } from '../apiService';
import { UserContext } from '../UserContext';

const AdminBookings = () => {
  const [bookings, setBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getAllBookingsGroupedByPackage();
        setBookings(data);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.type === 'ADMIN') {
      fetchBookings();
    }
  }, [user]);

  if (loading) return <p className="loading">Loading bookings...</p>;

  return (
    <div className="container mt-5 bookings-page">
      <h2 className="fw-bold text-center">Bookings Overview</h2>
      {Object.entries(bookings).map(([packageName, users]) => (
        <div key={packageName} className="mb-4">
          <h4 className="package-name">{packageName} ({users.length} bookings)</h4>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Booking ID</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {users.map((booking, index) => (
                <tr key={index}>
                  <td>{booking.userId}</td>
                  <td>{booking.userName}</td>
                  <td>{booking.userEmail}</td>
                  <td>{booking.bookingId}</td>
                  <td>${(booking.amount / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <style jsx>{`
        .bookings-page {
          background-color: #f5f5f5; /* Light gray background */
          min-height: 100vh;
          color: #000000; /* Black text */
          padding-bottom: 20px;
        }

        h2 {
          color: #000000; /* Black text */
          font-weight: bold;
        }

        .package-name {
          color: #00bcd4; /* Cyan for package name */
          margin-bottom: 15px;
        }

        .table {
          background-color: #ffffff; /* White background */
          border: 1px solid #999999; /* Medium gray border */
          border-radius: 8px;
          overflow: hidden;
        }

        .table thead {
          background-color: #000000; /* Black background */
          color: #ffffff; /* White text */
        }

        .table th,
        .table td {
          border: 1px solid #999999; /* Medium gray border */
          color: #000000; /* Black text */
        }

        .table-striped tbody tr:nth-of-type(odd) {
          background-color: #f0f0f0; /* Light gray background for odd rows */
        }

        .table-striped tbody tr:hover {
          background-color: #e0e0e0; /* Slightly darker gray on hover */
        }

        .loading {
          background-color: #f5f5f5; /* Light gray background */
          color: #000000; /* Black text */
          text-align: center;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default AdminBookings;