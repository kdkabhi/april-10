import React, { useState, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Login.css';
import { UserContext } from '../UserContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8080/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Login response:', data); // Debug
                // Set user data in context
                setUser({
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    type: data.type // Include type from backend
                });
                
                // Redirect based on user type
                if (data.type === 'ADMIN') {
                    navigate('/admin/dashboard'); // Redirect to Admin dashboard
                } else {
                    navigate('/'); // Redirect to AdventureAwareHome (for regular user)
                }
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage('An error occurred during login.');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container d-flex justify-content-center align-items-center vh-100">
                <div className="card p-4 shadow-lg" style={{ backgroundColor: "#ffffff", borderRadius: "10px" }}>
                    <h2 className="mb-4 text-center">Login</h2>
                    {message && <div className="alert alert-danger">{message}</div>}
                    <form onSubmit={handleSubmit}>
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
                        <button type="submit" className="btn btn-primary w-100">Login</button>
                    </form>
                    <p className="mt-3 text-center">
                        Don't have an account? <Link to="/signup">Sign up</Link>
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;
