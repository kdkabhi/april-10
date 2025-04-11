import React, { useState, useContext, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import { UserContext } from '../UserContext';
import team1 from "../team1.jpg";
import team2 from "../team2.jpg";
import team3 from "../team3.jpg";
import "./Contact.css"; // Import the CSS file for hover effects

const Contact = () => {
  const { user } = useContext(UserContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const teamMembers = [
    {
      name: "Puja Khadka",
      role: "Frontend Developer",
      description: "Expert in React, UI/UX design and responsive design",
      position: "left",
      image: team1
    },
    {
      name: "Sneha Baniya",
      role: "Backend Developer",
      description: "Experienced in Node.js and database management",
      position: "right",
      image: team3
    },
    {
      name: "Abhishek Khadka",
      role: "Full stack developer",
      description: "Skilled in both frontend and backend technologies",
      position: "center",
      image: team2
    }
  ];

  const store = {
    name: "Adventure Aware",
    hours: "Mon-Fri: 10:00am - 5:00pm",
    address: "2340 Dundas St W Suite 200, Toronto, ON M6P 4A9"
  };

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/contact/messages?email=${user.email}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error('Failed to fetch messages:', response.status);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.type === 'ADMIN') {
      fetchMessages();
    }
  }, [user, fetchMessages]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch('http://localhost:8080/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      if (response.ok) {
        setSubmitStatus('Submitted successfully');
        setFormData({ firstName: '', lastName: '', email: '', message: '' });
        setTimeout(() => setSubmitStatus(null), 3000);
      } else {
        setSubmitStatus('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('Error submitting form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
  
    // Debug: Log user and messageId to check their values
    console.log("User object:", user);
    console.log("Message ID:", messageId);
  
    // Check if user.email exists
    if (!user || !user.email) {
      console.error("User email is missing or user is not logged in");
      setSubmitStatus("Error: Please log in as an admin");
      return;
    }
  
    try {
      const url = `http://localhost:8080/api/contact/messages/${messageId}?email=${encodeURIComponent(user.email)}`;
      console.log("Sending DELETE request to:", url); // Debug: Log the exact URL
  
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include', // Sends session cookies if applicable
      });
  
      const responseData = await response.json(); // Get the response body
      console.log("Response status:", response.status, "Response data:", responseData); // Debug: Log status and body
  
      if (response.ok) {
        setMessages(messages.filter((msg) => msg.id !== messageId));
        setSubmitStatus('Message deleted successfully');
        setTimeout(() => setSubmitStatus(null), 3000);
      } else {
        console.error('Failed to delete message:', response.status, responseData);
        setSubmitStatus(`Failed to delete message: ${responseData.message || response.status}`);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setSubmitStatus('Error deleting message');
    }
  };

  const renderContactSection = () => {
    if (user && user.type === 'ADMIN') {
      return (
        <div className="col-md-6">
          <h3 className="mb-4">Contact Messages</h3>
          {isLoading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : messages.length > 0 ? (
            <div className="message-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className="card mb-3 message-card"
                  style={{ backgroundColor: 'rgba(140, 242, 239, 0.947)' }}
                >
                  <div className="card-body d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="card-title">{msg.firstName} {msg.lastName}</h5>
                      <h6 className="card-subtitle mb-2 text-muted">{msg.email}</h6>
                      <p className="card-text">{msg.message}</p>
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(msg.id)}
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No messages found.</p>
          )}
          {submitStatus && (
            <div className={`alert ${submitStatus.includes('success') ? 'alert-success' : 'alert-danger'} mt-3`}>
              {submitStatus}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="col-md-6">
        <form onSubmit={handleSubmit}>
          {submitStatus && (
            <div className={`alert ${submitStatus.includes('success') ? 'alert-success' : 'alert-danger'}`}>
              {submitStatus}
            </div>
          )}
          <div className="mb-4">
            <hr className="mb-4 border-2 border-top" />
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">First name*</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control border-0 border-bottom rounded-0"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Last name*</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control border-0 border-bottom rounded-0"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <hr className="mb-4 border-2 border-top" />
          </div>
          
          <div className="mb-4">
            <label className="form-label fw-bold">Email*</label>
            <input
              type="email"
              name="email"
              className="form-control mb-3 border-0 border-bottom rounded-0"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <hr className="mb-4 border-2 border-top" />
          </div>
          
          <div className="mb-4">
            <label className="form-label">What can we help you with?</label>
            <textarea
              name="message"
              className="form-control border-0 border-bottom rounded-0"
              rows="4"
              value={formData.message}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <hr className="mb-4 border-2 border-top" />
          </div>
          
          <div className="text-center">
            <button
              type="submit"
              className="btn btn-primary px-5 py-2 rounded-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" />
              ) : null}
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div>
      <Navbar user={user} />
      
      <div className="container py-4 text-center">
        <h3 className="fw-bold mb-4">Adventure Aware</h3>
        <h4 className="mb-4">Our Team Members</h4>
      </div>

      <div className="container py-5 position-relative" style={{ height: "550px" }}>
        <div className="position-absolute start-0" style={{ top: "0", width: "350px" }}>
          <div className="card border-0 bg-transparent team-card">
            <img 
              src={team1} 
              alt={teamMembers[0].name}
              className="img-fluid rounded"
              style={{ height: '400px', width: '350px', objectFit: 'cover' }}
            />
            <div className="card-body px-0 text-center">
              <h5 className="fw-bold">{teamMembers[0].name}</h5>
              <p className="text-primary">{teamMembers[0].role}</p>
              <p>{teamMembers[0].description}</p>
            </div>
          </div>
        </div>

        <div className="position-absolute end-0" style={{ top: "0", width: "350px" }}>
          <div className="card border-0 bg-transparent team-card">
            <img 
              src={team3} 
              alt={teamMembers[1].name}
              className="img-fluid rounded"
              style={{ height: '400px', width: '350px', objectFit: 'cover' }}
            />
            <div className="card-body px-0 text-center">
              <h5 className="fw-bold">{teamMembers[1].name}</h5>
              <p className="text-primary">{teamMembers[1].role}</p>
              <p>{teamMembers[1].description}</p>
            </div>
          </div>
        </div>

        <div className="position-absolute start-50 translate-middle-x" style={{ top: "70px", width: "350px" }}>
          <div className="card border-0 bg-transparent team-card">
            <img 
              src={team2} 
              alt={teamMembers[2].name}
              className="img-fluid rounded"
              style={{ height: '400px', width: '350px', objectFit: 'cover' }}
            />
            <div className="card-body px-0 text-center">
              <h5 className="fw-bold">{teamMembers[2].name}</h5>
              <p className="text-primary">{teamMembers[2].role}</p>
              <p>{teamMembers[2].description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid bg-light py-5" style={{ marginTop: "150px" }}>
       <div className="container">
       <h2 className="text-center fw-bold mb-4">Find a Store</h2>
       <div className="row g-0">
          <div className="col-md-6 pe-md-4">
            <div className="card mb-3 shadow-sm h-100">
              <div className="card-body">
              <h5 className="fw-bold">{store.name}</h5>
               <p>{store.hours}</p>
               <p className="text-muted">{store.address}</p>
                <p className="text-muted">Phone: 437-985-4102</p>
                <p className="text-muted">Email: <a href="mailto:adventureaware@traveladvisory.com">adventureaware@traveladvisory.com</a></p>
              </div>
            </div>
          </div>
          <div className="col-md-6 ps-md-0">
          <iframe 
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2886.5794787263144!2d-79.45478262382295!3d43.65691677110191!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b351266c2c95f%3A0xd3c1ce5712a3b234!2sSault%20College%20-%20Toronto%20Campus!5e0!3m2!1sen!2sca!4v1743739654637!5m2!1sen!2sca" 
             width="100%" 
             height="100%" 
              style={{ border: 0, minHeight: '300px' }}
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
           title="Store Location"
         ></iframe>
            </div>
        </div>
      </div>
    </div>

      <div className="container py-5">
        <h1 className="text-center mb-4">Contact us</h1>
        <div className="row">
          <div className="col-md-6 pe-md-5 d-flex align-items-center justify-content-center">
            <p className="text-center mb-0">
              Need to get in touch with us? Either fill out the form with your inquiry or find the department email you'd like to contact below.
            </p>
          </div>
          {renderContactSection()}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;