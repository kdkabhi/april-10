import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../UserContext';

const Message = () => {
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/contact/messages?email=${user.email}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setStatus('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch(`http://localhost:8080/api/contact/messages/${id}?email=${user.email}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await res.json();

      if (res.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
        setStatus('Message deleted successfully');
      } else {
        setStatus(result.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setStatus('Error deleting message');
    }
  };

  useEffect(() => {
    if (user?.type === 'ADMIN') {
      fetchMessages();
    }
  }, [user]);

  if (!user || user.type !== 'ADMIN') return <div className="p-4 access-denied">Access denied</div>;

  return (
    <div className="container mt-4 message-page">
      <h2 className="mb-4">Admin Messages</h2>
      {status && <div className="alert alert-info">{status}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <div className="list-group">
          {messages.map((msg) => (
            <div key={msg.id} className="list-group-item d-flex justify-content-between align-items-start message-item">
              <div>
                <h5>{msg.firstName} {msg.lastName}</h5>
                <small className="text-muted">{msg.email}</small>
                <p>{msg.message}</p>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(msg.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .message-page {
          background-color: #f5f5f5; /* Light gray background */
          min-height: 100vh;
          color: #000000; /* Black text */
          padding-bottom: 20px;
        }

        h2 {
          color: #000000; /* Black text */
          font-weight: bold;
        }

        .alert-info {
          background-color: #ffffff; /* White background */
          border: 1px solid #999999; /* Medium gray border */
          color: #666666; /* Medium gray text */
        }

        .list-group-item {
          background-color: #ffffff; /* White background */
          border: 1px solid #999999; /* Medium gray border */
          border-radius: 8px;
          margin-bottom: 10px;
          transition: transform 0.2s ease;
        }

        .list-group-item:hover {
          transform: translateY(-5px);
        }

        .message-item h5 {
          color: #000000; /* Black text */
          font-size: 1.1rem;
          margin-bottom: 5px;
        }

        .message-item .text-muted {
          color: #666666 !important; /* Medium gray text */
        }

        .message-item p {
          color: #000000; /* Black text */
          margin: 5px 0 0;
        }

        .btn-danger {
          background-color: #666666; /* Medium gray background */
          border-color: #666666;
          color: #ffffff; /* White text */
        }

        .btn-danger:hover {
          background-color: #00bcd4; /* Cyan on hover */
          border-color: #00bcd4;
        }

        .access-denied {
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

export default Message;