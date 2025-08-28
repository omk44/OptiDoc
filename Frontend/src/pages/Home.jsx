// src/pages/Home.jsx
import React, { useEffect, useState } from 'react'; // Import React hooks
import axios from 'axios'; // Import axios for making API requests
import { useNavigate } from 'react-router-dom';
import DoctorCard from '../components/DoctorCard';

export default function Home() {
  const [doctors, setDoctors] = useState([]); // State to store doctors fetched from API
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [error, setError] = useState(null); // State to manage API errors
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        setError(null); // Clear any previous errors

        // Fetch top doctors from backend (sorted by number of appointments)
        const response = await axios.get("http://localhost:5000/api/appointments/doctors/top?limit=3");
        setDoctors(response.data);
      } catch (err) {
        console.error("Error fetching doctors for Home page:", err);
        setError("Failed to load top doctors. Please try again later."); // Set error message
      } finally {
        setLoading(false); // Set loading to false after fetch attempt
      }
    };

    fetchDoctors(); // Call the fetch function when the component mounts
  }, []); // Empty dependency array means this effect runs only once after the initial render

  const handleBook = (doctor) => {
    // Store the ENTIRE doctor object (which now includes the MongoDB _id and localImage)
    localStorage.setItem('selectedDoctor', JSON.stringify(doctor));
    navigate('/book');
  };

  if (loading) {
    return <p className="p-4 text-center text-lg text-blue-600">Loading top doctors...</p>;
  }

  if (error) {
    return <p className="p-4 text-center text-lg text-red-600">{error}</p>;
  }

  return (
    <div className="px-6 py-10">
      {/* Introductory Text */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-700">Welcome to OptiDoc</h1>
        <p className="mt-4 text-gray-600">Your health, our priority.</p>
        <p className="text-gray-600">Book appointments with trusted doctors across India.</p>
        <p className="text-gray-600">Fast. Reliable. Patient-first healthcare experience.</p>
      </div>

      {/* Doctor Cards */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Top Doctors to Book</h2>
        <p className="text-gray-600 mb-8">Choose from our highly rated specialists.</p>

        <div className="flex flex-wrap justify-center gap-6">
          {doctors.length === 0 ? (
            <p className="text-gray-600">No top doctors available at the moment.</p>
          ) : (
            doctors.slice(0, 3).map((doctor) => {
              return (
                <div
                  key={doctor._id}
                  className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-xl transition-shadow duration-300 w-72"
                >
                  <Avatar fullName={doctor.fullName} imageUrl={doctor.imageUrl} />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{doctor.fullName}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-3">{doctor.specialty}</p>
                  <button
                    onClick={() => handleBook(doctor)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium w-full"
                  >
                    Book Appointment
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function Avatar({ fullName, imageUrl }) {
  const [failed, setFailed] = useState(false);
  const initials = (fullName || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => (w[0] || '').toUpperCase())
    .join('') || 'DR';

  if (imageUrl && !failed) {
    const src = imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`;
    return (
      <img
        src={src}
        alt={fullName}
        onError={() => setFailed(true)}
        className="w-32 h-32 object-cover rounded-full mb-4 border-4 border-blue-100"
      />
    );
  }

  return (
    <div className="w-32 h-32 rounded-full mb-4 border-4 border-blue-100 bg-indigo-100 flex items-center justify-center">
      <span className="text-3xl font-bold text-indigo-700">{initials}</span>
    </div>
  );
}
