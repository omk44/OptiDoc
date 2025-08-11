// src/components/DoctorCard.jsx
export default function DoctorCard({ doctor, onBook }) {
  return (
    <div className="bg-white shadow-md p-4 rounded-lg w-72">
      <img
        src={doctor.localImage} // Use doctor.localImage for the image source
        alt={doctor.fullName} // Use doctor.fullName for alt text
        className="w-full h-48 object-cover rounded"
      />
      <h3 className="text-xl font-semibold mt-4">{doctor.fullName}</h3> {/* Use doctor.fullName */}
      <p className="text-gray-600">{doctor.specialty}</p>
        <button
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          onClick={onBook}
        >
          Book Appointment
        </button>
      {/* )} */}
    </div>
  )
}
