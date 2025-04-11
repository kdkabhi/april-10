import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { UserContext } from '../UserContext';
import { FaTimes } from 'react-icons/fa';

const ProfileSection = ({ title, items, onItemClick, onRemoveItem, isFavorite }) => (
    <div className="container mb-4 p-4 border rounded shadow-sm bg-white">
        <h4 className="mb-3">{title}</h4>
        {items.length > 0 ? (
            <ul className="list-group">
                {items.map(item => (
                    <li
                        key={item.id}
                        className="list-group-item d-flex align-items-center position-relative"
                        onClick={() => onItemClick(item.id)}
                        style={{
                            cursor: 'pointer',
                            padding: '10px 15px', // Reduced padding
                            marginBottom: '5px', // Reduced space between items
                        }}
                    >
                        <img
                            src={`http://localhost:8080/uploads/${item.imageUrls?.[0]}`}
                            alt={item.name}
                            className="rounded"
                            style={{
                                width: '80px', // Adjusted size
                                height: '80px', // Adjusted size
                                objectFit: 'cover',
                                marginRight: '10px', // Reduced margin
                            }}
                        />
                        <div>
                            <div>{item.name}</div>
                            {item.date && (
                                <div className="text-muted">{new Date(item.date).toLocaleDateString()}</div>
                            )}
                        </div>
                        {isFavorite ? (
                            <button
                                className="btn btn-link position-absolute top-0 end-0"
                                style={{ padding: '5px' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveItem(item.id);
                                }}
                            >
                                <FaTimes color="red" />
                            </button>
                        ) : (
                            item.date && (
                                <span
                                    className="position-absolute top-0 end-0 badge rounded-pill bg-primary"
                                    style={{ fontSize: '0.9rem', padding: '5px 10px' }}
                                >
                                    {calculateDaysUntil(item.date)} days
                                </span>
                            )
                        )}
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-muted">No {title.toLowerCase()} yet.</p>
        )}
    </div>
);

const calculateDaysUntil = (packageDate) => {
    const today = new Date();
    const startDate = new Date(packageDate);
    return Math.max(Math.ceil((startDate - today) / (1000 * 60 * 60 * 24)), 0);
};

const Profile = () => {
    const [favorites, setFavorites] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const [favRes, bookRes] = await Promise.all([
                    fetch(`http://localhost:8080/api/favorites?userId=${user.id}`),
                    fetch(`http://localhost:8080/api/bookings?userId=${user.id}`)
                ]);
                
                if (!favRes.ok || !bookRes.ok) throw new Error('Failed to fetch data');
                
                const [favData, bookData] = await Promise.all([favRes.json(), bookRes.json()]);
                
                setFavorites(favData);
                setBookings(bookData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handlePackageClick = (packageId) => navigate(`/?packageId=${packageId}`);

    const removeFavorite = async (packageId) => {
        if (!user) return console.error('User not logged in');

        try {
            const response = await fetch('http://localhost:8080/api/favorites', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, packageId }),
            });

            if (response.ok) {
                setFavorites(prev => prev.filter(fav => fav.id !== packageId));
            } else {
                console.error('Failed to remove favorite');
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-5">
                <h2 className="text-center">Profile</h2>

                {/* User Info Section */}
                <div className="container mb-4 p-4 border rounded shadow-sm bg-white">
                    <h4>User Information</h4>
                    {user ? (
                        <>
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                        </>
                    ) : (
                        <p className="text-muted">Please log in to view your profile.</p>
                    )}
                </div>

                {loading ? (
                    <p className="text-center">Loading...</p>
                ) : (
                    <div className="row">
                        {/* Favorites Section */}
                        <div className="col-md-6">
                            <ProfileSection 
                                title="Favorites" 
                                items={favorites} 
                                onItemClick={handlePackageClick} 
                                onRemoveItem={removeFavorite} 
                                isFavorite 
                            />
                        </div>

                        {/* Bookings Section */}
                        <div className="col-md-6">
                            <ProfileSection 
                                title="Bookings" 
                                items={bookings} 
                                onItemClick={handlePackageClick} 
                            />
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Profile;