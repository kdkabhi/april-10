// AdminDashboard.js (updated)
import React, { useState, useEffect, useContext, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getPackages, createPackage, updatePackage, deletePackage } from '../apiService';
import { UserContext } from '../UserContext';
import './AdminDashboard.css'; // Import the CSS file

const AdminDashboard = () => {
  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    days: "",
    date: "",
    description: "",
    itinerary: "",
    images: [],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentPackageId, setCurrentPackageId] = useState(null);
  const { user } = useContext(UserContext);
  const formRef = useRef(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const data = await getPackages();
      setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      images: Array.from(e.target.files),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('days', formData.days);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('itinerary', formData.itinerary);

      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      if (isEditing) {
        const updatedPackage = await updatePackage(currentPackageId, formDataToSend);
        setPackages(packages.map(pkg => (pkg.id === updatedPackage.id ? updatedPackage : pkg)));
      } else {
        const createdPackage = await createPackage(formDataToSend);
        setPackages([...packages, createdPackage]);
      }

      resetForm();
    } catch (error) {
      console.error('Error submitting package:', error);
    }
  };

  const handleEditPackage = (pkg) => {
    setFormData({
      name: pkg.name,
      price: pkg.price,
      days: pkg.days,
      date: pkg.date,
      description: pkg.description,
      itinerary: pkg.itinerary,
      images: [],
    });
    setIsEditing(true);
    setCurrentPackageId(pkg.id);

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeletePackage = async (id) => {
    try {
      await deletePackage(id);
      setPackages(packages.filter(pkg => pkg.id !== id));
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      days: "",
      date: "",
      description: "",
      itinerary: "",
      images: [],
    });
    setIsEditing(false);
    setCurrentPackageId(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-page">
      <div className="container mt-5">
        <h2 className="text-center fw-bold">Admin Dashboard - Manage Packages</h2>

        <div className="mb-4 form-section" ref={formRef}>
          <h4>{isEditing ? "Edit Package" : "Add New Package"}</h4>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Package Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Duration (Days)"
              name="days"
              value={formData.days}
              onChange={handleInputChange}
            />
            <input
              type="date"
              className="form-control mb-2"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
            />
            <textarea
              className="form-control mb-2"
              placeholder="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              style={{ height: "50px" }}
            ></textarea>
            <textarea
              className="form-control mb-2"
              placeholder="Itinerary (e.g., hotel, flights, places to visit)"
              name="itinerary"
              value={formData.itinerary}
              onChange={handleInputChange}
            ></textarea>
            <input
              type="file"
              className="form-control mb-2"
              onChange={handleFileChange}
              multiple
            />
            <button type="submit" className="btn btn-accent">
              {isEditing ? "Update Package" : "Add Package"}
            </button>
            {isEditing && (
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        <table className="table table-striped mt-4">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Date</th>
              <th>Description</th>
              <th>Itinerary</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td>{pkg.name}</td>
                <td>{pkg.price}</td>
                <td>{pkg.days}</td>
                <td>{formatDate(pkg.date)}</td>
                <td
                  style={{
                    maxWidth: "200px",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis"
                  }}
                  title={pkg.description}
                >
                  {pkg.description}
                </td>
                <td
                  style={{
                    maxWidth: "250px",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis"
                  }}
                  title={pkg.itinerary}
                >
                  {pkg.itinerary}
                </td>
                <td>
                  <img
                    src={`http://localhost:8080/uploads/${pkg.imageUrls[0]}`}
                    alt={pkg.name}
                    style={{ width: "100px" }}
                  />
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm me-2"
                    onClick={() => handleDeletePackage(pkg.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="btn btn-accent btn-sm"
                    onClick={() => handleEditPackage(pkg)}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;