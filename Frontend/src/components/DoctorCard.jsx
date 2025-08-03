// src/components/DoctorCard.jsx
export default function DoctorCard({ doctor, onBook }) {
  return (
    <div className="bg-white shadow-md p-4 rounded-lg w-72">
      <img src={doctor.image} alt={doctor.name} className="w-full h-48 object-cover rounded" />
      <h3 className="text-xl font-semibold mt-4">{doctor.name}</h3>
      <p className="text-gray-600">{doctor.specialty}</p>
      <p className="text-gray-500 text-sm">{doctor.hospital}</p>
      <p className={`mt-1 text-sm ${doctor.available ? 'text-green-600' : 'text-red-600'}`}>
        {doctor.available ? 'Available' : 'Unavailable'}
      </p>
      {doctor.available && (
        <button
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          onClick={onBook}
        >
          Book Appointment
        </button>
      )}
    </div>
  )
}
