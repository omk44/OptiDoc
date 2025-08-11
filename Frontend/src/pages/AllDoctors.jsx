// src/pages/AllDoctors.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Re-import all your local doctor images
import doc1 from "../assets/doctor1.png";
import doc2 from "../assets/doctor2.png";
import doc3 from "../assets/doctor3.png";
import doc4 from "../assets/doctor4.png";
import doc5 from "../assets/doctor5.png";
import doc6 from "../assets/doctor6.png";
import doc7 from "../assets/doctor7.png";
import doc8 from "../assets/doctor8.png";
import doc9 from "../assets/doctor9.png";
import doc10 from "../assets/doctor10.png";
import doc11 from "../assets/doctor11.png";
import doc12 from "../assets/doctor12.png";

// Create a mapping object for easy access to images by a simple ID or index
const localDoctorImages = [
  doc1, doc2, doc3, doc4, doc5, doc6,
  doc7, doc8, doc9, doc10, doc11, doc12
];

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
        
        // Assign a localImageIndex to each doctor based on their order in the fetched array
        const doctorsWithImages = response.data.map((doctor, index) => ({
          ...doctor,
          // Use the local image if available, otherwise fall back to a placeholder
          localImage: localDoctorImages[index] || `https://placehold.co/128x128/cccccc/ffffff?text=${doctor.fullName.split(' ').map(n => n[0]).join('')}`
        }));
        
        setDoctors(doctorsWithImages);
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
    return <p className="p-4 text-center text-lg text-blue-600">Loading doctors...</p>;
  }

  if (error) {
    return <p className="p-4 text-center text-lg text-red-600">{error}</p>;
  }

  if (doctors.length === 0) {
    return <p className="p-4 text-center text-lg text-gray-600">No doctors available at the moment.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Our Expert Doctors</h1>
      
      {/* Specialty Filter */}
      <div className="mb-8 text-center">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedSpecialty("all")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              selectedSpecialty === "all"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
            }`}
          >
            All Specialties ({doctors.length})
          </button>
          {uniqueSpecialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedSpecialty === specialty
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
              }`}
            >
              {specialty}s ({doctors.filter(doc => doc.specialty === specialty).length})
            </button>
          ))}
        </div>
      </div>

      {/* Show All Doctors (when "All Specialties" is selected) */}
      {selectedSpecialty === "all" && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600 text-center">All Doctors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={doctor.localImage}
                  alt={doctor.fullName}
                  className="w-32 h-32 object-cover rounded-full mb-4 border-4 border-blue-100"
                />
                <h3 className="text-lg font-bold text-gray-800 mb-2">{doctor.fullName}</h3>
                <p className="text-sm text-blue-600 font-medium mb-3">{doctor.specialty}</p>
                <button
                  onClick={() => handleBook(doctor)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show Doctors by Specialty (when a specific specialty is selected) */}
      {selectedSpecialty !== "all" && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600 text-center">{selectedSpecialty}s</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={doctor.localImage}
                  alt={doctor.fullName}
                  className="w-32 h-32 object-cover rounded-full mb-4 border-4 border-blue-100"
                />
                <h3 className="text-lg font-bold text-gray-800 mb-2">{doctor.fullName}</h3>
                <p className="text-sm text-blue-600 font-medium mb-3">{doctor.specialty}</p>
                <button
                  onClick={() => handleBook(doctor)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back to All Specialties Button */}
      {selectedSpecialty !== "all" && (
        <div className="text-center mt-8">
          <button
            onClick={() => setSelectedSpecialty("all")}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
          >
            ← Back to All Specialties
          </button>
        </div>
      )}
    </div>
  );
}