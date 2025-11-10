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
    const fetchTopDoctors = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/doctors/top?limit=3");
        setDoctors(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top doctors:", error);
        setError("Failed to load top doctors. Please try again later.");
        setLoading(false);
      }
    };

    fetchTopDoctors();
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Welcome to OptiDoc</h1>
          <p className="text-xl md:text-2xl mb-4 font-light">Your Health, Our Priority</p>
          <p className="text-lg md:text-xl mb-3 opacity-90">Book appointments with trusted doctors across India</p>
          <p className="text-lg md:text-xl opacity-90">Fast • Reliable • Patient-First Healthcare</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Easy Booking</h3>
            <p className="text-gray-600">Book appointments in seconds with our intuitive platform</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Trusted Doctors</h3>
            <p className="text-gray-600">Access to verified and experienced medical professionals</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">24/7 Access</h3>
            <p className="text-gray-600">Manage your appointments anytime, anywhere</p>
          </div>
        </div>

        {/* Top Doctors Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Top Doctors</h2>
          <p className="text-xl text-gray-600">Choose from our highly rated specialists</p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {doctors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No top doctors available at the moment.</p>
            </div>
          ) : (
            doctors.slice(0, 3).map((doctor) => {
              return (
                <div
                  key={doctor._id}
                  className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 w-80 border border-gray-100"
                >
                  <Avatar fullName={doctor.fullName} imageUrl={doctor.imageUrl} />
                  <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{doctor.fullName}</h3>
                  <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    {doctor.specialty}
                  </div>
                  <button
                    onClick={() => handleBook(doctor)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Book Appointment →
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-12 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-6 opacity-90">Browse our complete directory of specialist doctors</p>
          <button
            onClick={() => navigate('/doctors')}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-colors duration-200 font-bold text-lg shadow-lg"
          >
            View All Doctors
          </button>
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
        className="w-40 h-40 object-cover rounded-full mb-6 border-4 border-blue-200 shadow-lg"
      />
    );
  }

  return (
    <div className="w-40 h-40 rounded-full mb-6 border-4 border-blue-200 bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-lg">
      <span className="text-4xl font-bold text-blue-700">{initials}</span>
    </div>
  );
}
