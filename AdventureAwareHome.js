import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaFacebook, FaInstagram, FaTwitter, FaStar, FaRegStar, FaTimes } from 'react-icons/fa';
import './AdventureAwareHome.css';
import { getPackages } from '../apiService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { UserContext } from '../UserContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51R7mc4KtHMdAsGakAfx9TFLN07CvfAd1R5DF2CHlYUPVx83jEI6TmbgMpkvgDkYO0tsP1bgjjed5PXOiAX6uK8wO00MRRSn1x8');

const PaymentForm = ({ clientSecret, orderId, onSuccess, onCancel, packageName, amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [cardholderName, setCardholderName] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        const cardNumberElement = elements.getElement(CardNumberElement);
        const cardExpiryElement = elements.getElement(CardExpiryElement);
        const cardCvcElement = elements.getElement(CardCvcElement);

        const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardNumberElement,
                billing_details: {
                    name: cardholderName,
                },
            },
        });

        if (error) {
            console.error('Payment failed:', error);
            setError(error.message);
        } else if (paymentIntent.status === 'succeeded') {
            const response = await fetch('http://localhost:8080/api/confirm-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, paymentId: paymentIntent.id }),
            });
            if (response.ok) {
                onSuccess();
            } else {
                console.error('Failed to confirm payment on server');
                setError('Failed to confirm payment on server');
            }
        }
    };

    const elementStyles = {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
                color: '#aab7c4',
            },
        },
        invalid: {
            color: '#9e2146',
        },
    };

    return (
        <form onSubmit={handleSubmit}>
            <h5 className="text-center mb-3">Package Payment</h5>
            <p className="text-center mb-4">Amount: €{amount}</p>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6>Enter card details.</h6>
            </div>
            <div className="mb-3">
                <label className="form-label">Card number</label>
                <div className="form-control p-2">
                    <CardNumberElement options={{ style: elementStyles }} />
                </div>
            </div>
            <div className="mb-3">
                <label className="form-label">Cardholder name</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Cardholder name"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    required
                />
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Expiry date</label>
                    <div className="form-control p-2">
                        <CardExpiryElement options={{ style: elementStyles }} />
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Security code</label>
                    <div className="form-control p-2">
                        <CardCvcElement options={{ style: elementStyles }} />
                    </div>
                </div>
            </div>
            {error && <div className="text-danger mb-3">{error}</div>}
            <button type="submit" className="btn btn-primary w-100 mb-2" disabled={!stripe}>
                <span role="img" aria-label="heart">💙</span> PAY
            </button>
            <button type="button" className="btn btn-light w-100" onClick={onCancel}>
                CANCEL
            </button>
            <p className="text-center text-muted mt-3 small">
                Secure payments certified. Powered by Stripe Ⓢ
            </p>
        </form>
    );
};

const AdventureAwareHome = () => {
    const [packages, setPackages] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [showConfirm, setShowConfirm] = useState(null);
    const [showPayment, setShowPayment] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [bookingCounts, setBookingCounts] = useState({});
    const { user } = useContext(UserContext);
    const location = useLocation();
    const navigate = useNavigate();
    const packageRefs = useRef({});

    console.log('User from context:', user);

    // Fetch packages on mount
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const data = await getPackages();
                console.log('Packages fetched:', data);
                setPackages(data);
            } catch (error) {
                console.error('Error fetching packages:', error);
            }
        };
        fetchPackages();
    }, []);

    // Fetch favorites and booking counts after packages are loaded
    useEffect(() => {
        const loadData = async () => {
            if (user) {
                console.log('User is logged in, fetching favorites and booking counts');
                await fetchFavorites();
                if (user.type === 'ADMIN' && packages.length > 0) {
                    console.log('User is admin, fetching booking counts');
                    await fetchBookingCounts();
                    const interval = setInterval(() => {
                        console.log('Periodic refresh of booking counts');
                        fetchBookingCounts();
                    }, 30000); // Refresh every 30 seconds
                    return () => clearInterval(interval);
                }
            }
        };
        loadData();
    }, [user, packages.length]);

    // Handle package scroll on query param
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const packageId = queryParams.get('packageId');
        if (packageId && packages.length > 0) {
            const targetPackage = packageRefs.current[packageId];
            if (targetPackage) {
                targetPackage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                document.body.style.overflow = 'auto';
            }
        }
    }, [location.search, packages]);

    const fetchFavorites = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/favorites?userId=${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch favorites');
            const data = await response.json();
            setFavorites(data.map(fav => fav.id));
            console.log('Favorites fetched:', data);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const fetchBookingCounts = async () => {
        try {
            const counts = {};
            for (const pkg of packages) {
                const response = await fetch(`http://localhost:8080/api/bookings/count?packageId=${pkg.id}`);
                if (!response.ok) throw new Error(`Failed to fetch count for package ${pkg.id}`);
                const data = await response.json();
                console.log(`Booking count for package ${pkg.id}:`, data.count);
                counts[pkg.id] = data.count;
            }
            setBookingCounts(counts);
            console.log('Updated booking counts:', counts);
        } catch (error) {
            console.error('Error fetching booking counts:', error);
        }
    };

    const toggleFavorite = async (pkgId) => {
        if (!user) {
            alert('Please login to add/remove favorites.');
            return;
        }
        try {
            const response = await fetch('http://localhost:8080/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, packageId: pkgId }),
            });
            if (response.ok) {
                const updatedFavorites = await response.json();
                setFavorites(updatedFavorites.map(fav => fav.id));
            } else {
                console.error('Failed to toggle favorite');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleBook = (pkg) => {
        if (!user) {
            alert('Please login to book a package.');
            return;
        }
        setShowConfirm(pkg);
    };

    const confirmBooking = async () => {
        if (!showConfirm) return;
        try {
            const response = await fetch('http://localhost:8080/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, packageId: showConfirm.id }),
            });
            const data = await response.json();
            console.log('Booking response:', data);
            if (response.ok) {
                const { clientSecret, orderId } = data;
                setShowPayment({ package: showConfirm, clientSecret, orderId });
                setShowConfirm(null);
            } else {
                alert(`Failed to initiate booking: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error booking package:', error);
            alert('An error occurred while booking the package.');
        }
    };

    const cancelBooking = () => {
        setShowConfirm(null);
    };

    const handlePaymentSuccess = () => {
        setShowPayment(null);
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
            navigate('/profile');
            if (user && user.type === 'ADMIN') {
                console.log('Payment successful, re-fetching booking counts for admin');
                fetchBookingCounts();
            }
        }, 3000);
    };

    const handlePaymentCancel = () => {
        setShowPayment(null);
    };

    const showItinerary = (pkg) => {
        setSelectedItinerary(pkg);
    };

    const closeItinerary = () => {
        setSelectedItinerary(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div style={{ minHeight: '100vh', overflowY: 'auto' }}>
            <Navbar user={user} />
            <div className="container" style={{ maxWidth: '1200px', padding: 0 }}>
                <header className="text-white text-center py-5" style={{ height: '500px', width: '100%', position: 'relative' }}>
                    <video autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}>
                        <source src="/capstone1 video.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="d-flex flex-column justify-content-center align-items-center h-100 text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)', position: 'relative', zIndex: 1 }}>
                        <h1 className="display-4 fw-bold" style={{ fontFamily: "'Roboto', sans-serif", fontSize: '3rem' }}>
                            Explore Canada's Best Travel Destinations
                        </h1>
                        <p className="lead" style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '1.25rem' }}>
                            Your gateway to unforgettable adventures
                        </p>
                    </div>
                </header>
            </div>

            <div className="container mt-5" style={{ overflowY: 'auto' }}>
                <h2 className="text-center fw-bold">Our Packages</h2>
                <div className="row d-flex justify-content-center">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="col-md-4 mb-4 d-flex align-items-stretch"
                            ref={(el) => (packageRefs.current[pkg.id] = el)}
                        >
                            <div className="card shadow-sm border-0 w-100" style={{ height: "600px", display: 'flex', flexDirection: 'column' }}>
                                <img
                                    src={`http://localhost:8080/uploads/${pkg.imageUrls[0]}`}
                                    className="card-img-top"
                                    alt={pkg.name}
                                    style={{ height: "250px", objectFit: "cover" }}
                                />
                                <div className="card-body text-center d-flex flex-column" style={{ flex: '1 1 auto' }}>
                                    <h5 className="card-title fw-bold">{pkg.name}</h5>
                                    <p className="card-text">{pkg.description}</p>
                                    <p><strong>Price:</strong> ${pkg.price}</p>
                                    <p><strong>Duration:</strong> {pkg.days} days</p>
                                    <p><strong>Date:</strong> {formatDate(pkg.date)}</p>
                                    <div className="mt-auto">
                                        {user && user.type === 'ADMIN' ? (
                                            <p><strong>Bookings:</strong> {bookingCounts[pkg.id] || 0}</p>
                                        ) : (
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="btn btn-success btn-sm" onClick={() => handleBook(pkg)}>Book</button>
                                                <button className="btn btn-info btn-sm" onClick={() => showItinerary(pkg)}>Detail</button>
                                                <button className="btn btn-light btn-sm" onClick={() => toggleFavorite(pkg.id)}>
                                                    {favorites.includes(pkg.id) ? <FaStar color="gold" /> : <FaRegStar />}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedItinerary && (
                <div className="itinerary-modal">
                    <div className="itinerary-content">
                        <button className="close-btn" onClick={closeItinerary}><FaTimes /></button>
                        <h4 className="fw-bold">{selectedItinerary.name}</h4>
                        <p style={{ whiteSpace: 'pre-line' }}>{selectedItinerary.itinerary}</p>
                    </div>
                </div>
            )}

            {showConfirm && (
                <div className="confirm-modal">
                    <div className="confirm-content">
                        <h4>Confirm Booking</h4>
                        <p>Do you want to book this package: {showConfirm.name}?</p>
                        <button className="btn btn-success me-2" onClick={confirmBooking}>Yes</button>
                        <button className="btn btn-danger" onClick={cancelBooking}>No</button>
                    </div>
                </div>
            )}

            {showPayment && (
                <div className="payment-modal">
                    <div className="payment-content">
                        <button className="close-btn" onClick={handlePaymentCancel}><FaTimes /></button>
                        <Elements stripe={stripePromise}>
                            <PaymentForm
                                clientSecret={showPayment.clientSecret}
                                orderId={showPayment.orderId}
                                onSuccess={handlePaymentSuccess}
                                onCancel={handlePaymentCancel}
                                packageName={showPayment.package.name}
                                amount={showPayment.package.price}
                            />
                        </Elements>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="success-modal">
                    <div className="success-content">
                        <h4 className="text-center text-success">Payment Successful!</h4>
                        <p className="text-center">Thank you for booking your package. Redirecting to your profile...</p>
                    </div>
                </div>
            )}

            <style jsx>{`
                .itinerary-modal, .confirm-modal, .payment-modal, .success-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    overflow: auto;
                }
                .itinerary-content, .confirm-content, .payment-content, .success-content {
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    width: 400px;
                    text-align: left;
                    position: relative;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                .itinerary-content h4 {
                    margin-bottom: 15px;
                    text-align: center;
                }
                .itinerary-content p {
                    margin-bottom: 8px;
                    font-size: 1rem;
                    line-height: 1.5;
                }
                .close-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                }
            `}</style>
            <Footer />
        </div>
    );
};

export default AdventureAwareHome;