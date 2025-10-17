// src/pages/AllDoctors.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AllDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get("http://localhost:5000/api/appointments/doctors");
        // Backend already provides imageUrl or we will fallback in the UI
        setDoctors(response.data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Get unique specialties dynamically from the doctors data
  const uniqueSpecialties = [...new Set(doctors.map(doctor => doctor.specialty))].sort();

  // Filter doctors based on selected specialty
  const filteredDoctors = selectedSpecialty === "all" 
    ? doctors 
    : doctors.filter(doctor => doctor.specialty === selectedSpecialty);

  const handleBook = (doctor) => {
    // Store the ENTIRE doctor object (which now includes the MongoDB _id and localImage)
    localStorage.setItem("selectedDoctor", JSON.stringify(doctor));
    navigate("/book");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-blue-600 font-semibold">Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <p className="text-xl text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <p className="text-xl text-gray-600">No doctors available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Our Expert Doctors</h1>
          <p className="text-xl opacity-90">Browse and book appointments with verified specialists</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Specialty filter buttons */}
        <div className="mb-12">
          <h3 className="text-center text-gray-700 font-semibold mb-4 text-lg">Filter by Specialty</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedSpecialty("all")}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                selectedSpecialty === "all"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              All Specialties ({doctors.length})
            </button>
            {uniqueSpecialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                  selectedSpecialty === specialty
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {specialty} ({doctors.filter(doc => doc.specialty === specialty).length})
              </button>
            ))}
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="mb-8">
          {selectedSpecialty !== "all" && (
            <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
              {selectedSpecialty} Specialists
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100"
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
            ))}
          </div>
        </div>

        {/* Back to All Specialties Button */}
        {selectedSpecialty !== "all" && (
          <div className="text-center mt-12">
            <button
              onClick={() => setSelectedSpecialty("all")}
              className="px-8 py-4 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              ← Back to All Specialties
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ fullName, imageUrl }) {
  const [failed, setFailed] = React.useState(false);
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