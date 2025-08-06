// src/pages/Home.jsx
import React, { useEffect, useState } from 'react'; // Import React hooks
import axios from 'axios'; // Import axios for making API requests
import { useNavigate } from 'react-router-dom';
import DoctorCard from '../components/DoctorCard';

// Re-import all your local doctor images
import doctor1 from '../assets/doctor1.png';
import doctor2 from '../assets/doctor2.png';
import doctor3 from '../assets/doctor3.png';
import doctor4 from '../assets/doctor4.png';
import doctor5 from '../assets/doctor5.png';
import doctor6 from '../assets/doctor6.png';
import doctor7 from '../assets/doctor7.png';
import doctor8 from '../assets/doctor8.png';
import doctor9 from '../assets/doctor9.png';
import doctor10 from '../assets/doctor10.png';
import doctor11 from '../assets/doctor11.png';
import doctor12 from '../assets/doctor12.png';

// Create a mapping array for easy access to images by index
const localDoctorImages = [
  doctor1, doctor2, doctor3, doctor4, doctor5, doctor6,
  doctor7, doctor8, doctor9, doctor10, doctor11, doctor12
];

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

        // Make an API call to your backend to get the list of doctors
        const response = await axios.get("http://localhost:5000/api/appointments/doctors");
        
        // Assign a localImage to each doctor based on their order in the fetched array
        const doctorsWithImages = response.data.map((doctor, index) => ({
          ...doctor,
          // Use the local image if available, otherwise fall back to a placeholder
          localImage: localDoctorImages[index] || `https://placehold.co/128x128/cccccc/ffffff?text=${doctor.fullName.split(' ').map(n => n[0]).join('')}`
        }));
        setDoctors(doctorsWithImages); // Update state with fetched doctors
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
            doctors.slice(0, 3).map((doctor) => ( // Display only the first 3 doctors as "top doctors"
              <DoctorCard
                key={doctor._id} // Use MongoDB _id as key
                doctor={doctor}
                onBook={() => handleBook(doctor)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
