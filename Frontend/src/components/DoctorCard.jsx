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
      {/* The 'hospital' field is not present in your current Doctor schema from the database.
          If you need to display hospital information, you'll need to add it to your Doctor model
          and ensure it's populated in your database.
      <p className="text-gray-500 text-sm">{doctor.hospital}</p>
      */}
      {/* Removed the availability text and its conditional rendering */}
      {/* <p className={`mt-1 text-sm ${doctor.available ? 'text-green-600' : 'text-red-600'}`}>
        {doctor.available ? 'Available' : 'Unavailable'}
      </p> */}
      {/* The button will now always be visible, regardless of the 'available' status.
          If you want to control button visibility based on availability,
          you would uncomment the conditional rendering for the button. */}
      {/* {doctor.available && ( */}
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
