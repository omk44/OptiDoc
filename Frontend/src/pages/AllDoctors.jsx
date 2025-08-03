// src/pages/AllDoctors.jsx
import doctors from "../data/doctors";
import { useNavigate } from "react-router-dom";

export default function AllDoctors() {
  const specialties = ["Cardiologist", "Neurologist", "Dermatologist"];
  const navigate = useNavigate();

  const handleBook = (doctor) => {
    localStorage.setItem("selectedDoctor", JSON.stringify(doctor));
    navigate("/book");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">All Doctors</h1>
      {specialties.map((specialty) => (
        <div key={specialty} className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-600">{specialty}s</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {doctors
              .filter((doc) => doc.specialty === specialty)
              .map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-xl shadow p-4 flex flex-col items-center"
                >
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-32 h-32 object-cover rounded-full mb-3"
                  />
                  <h3 className="text-lg font-bold">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">{doctor.hospital}</p>
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
