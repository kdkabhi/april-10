import React, { useState, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Login.css';
import { UserContext } from '../UserContext';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            setSuccess(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name })
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Signup response:', data);
                setSuccess(true);
                setMessage('Sign up successful! Redirecting to login page...');
                setTimeout(() => {
                    navigate('/login', { replace: true }); // Redirect to login page after 3 seconds
                }, 3000);
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            console.error('Signup error:', error);
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container d-flex justify-content-center align-items-center vh-100">
                <div className="card p-4 shadow-lg" style={{ backgroundColor: "#ffffff", borderRadius: "10px" }}>
                    <h2 className="mb-4 text-center">Sign Up</h2>
                    {message && <div className={`alert ${success ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Sign Up</button>
                    </form>
                    <p className="mt-3 text-center">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Signup;
