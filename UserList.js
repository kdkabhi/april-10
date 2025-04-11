import React, { useEffect, useState } from 'react';
import { getUsers } from '../apiService';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getUsers();
        console.log("Fetched users:", userList);
        if (Array.isArray(userList)) {
          setUsers(userList);
        } else {
          throw new Error("Unexpected response format: Expected an array.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container mt-5 user-list-page">
      <h2 className="text-center fw-bold">User List</h2>
      {users.length === 0 ? (
        <p className="text-center">No users found.</p>
      ) : (
        <table className="table table-striped mt-4">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style jsx>{`
        .user-list-page {
          background-color: #f5f5f5; /* Light gray background */
          min-height: 100vh;
          color: #000000; /* Black text */
          padding-bottom: 20px;
        }

        h2 {
          color: #000000; /* Black text */
          font-weight: bold;
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

        .loading,
        .error {
          background-color: #f5f5f5; /* Light gray background */
          color: #000000; /* Black text */
          text-align: center;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        p.text-center {
          color: #666666; /* Medium gray text */
        }
      `}</style>
    </div>
  );
};

export default UserList;