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
// This assumes a consistent order or a way to map doctor data to these images.
// For simplicity, we'll map them by an assumed order for now.
// A more robust solution might involve storing a specific image identifier (e.g., "doc1")
// in your database's imageUrl field, and then dynamically importing/selecting the image.
const localDoctorImages = [
  doc1, doc2, doc3, doc4, doc5, doc6,
  doc7, doc8, doc9, doc10, doc11, doc12
];

export default function AllDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const specialties = ["Cardiologist", "Neurologist", "Dermatologist"];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get("http://localhost:5000/api/appointments/doctors");
        // Assign a localImageIndex to each doctor based on their order in the fetched array
        // This is a simple way to link them to your imported images.
        // If your database has an 'imageIdentifier' field (e.g., "doc1"),
        // you could use that to map to the local images more robustly.
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
      <h1 className="text-2xl font-bold mb-4 text-center">Our Expert Doctors</h1>
      {specialties.map((specialty) => (
        <div key={specialty} className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-600">{specialty}s</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {doctors
              .filter((doc) => doc.specialty === specialty)
              .map((doctor) => (
                <div
                  key={doctor._id}
                  className="bg-white rounded-xl shadow p-4 flex flex-col items-center"
                >
                  <img
                    src={doctor.localImage} // <--- Use the localImage property
                    alt={doctor.fullName}
                    className="w-32 h-32 object-cover rounded-full mb-3"
                  />
                  <h3 className="text-lg font-bold">{doctor.fullName}</h3>
                  <p className="text-sm text-gray-500">{doctor.specialty}</p>
                  <button
                    onClick={() => handleBook(doctor)}
                    className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}