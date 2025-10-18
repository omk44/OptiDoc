// src/components/DoctorCard.jsx
import { useState } from 'react';

export default function DoctorCard({ doctor, onBook }) {
  const [imageFailed, setImageFailed] = useState(false);
  
  const initials = (doctor.fullName || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => (w[0] || '').toUpperCase())
    .join('') || 'DR';

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 w-80 border border-gray-100">
      {/* Doctor Image/Avatar */}
      {doctor.imageUrl && !imageFailed ? (
        <img
          src={doctor.imageUrl.startsWith('http') ? doctor.imageUrl : `http://localhost:5000${doctor.imageUrl}`}
          alt={doctor.fullName}
          onError={() => setImageFailed(true)}
          className="w-40 h-40 object-cover rounded-full mb-6 border-4 border-blue-200 shadow-lg"
        />
      ) : (
        <div className="w-40 h-40 rounded-full mb-6 border-4 border-blue-200 bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-lg">
          <span className="text-4xl font-bold text-blue-700">{initials}</span>
        </div>
      )}
      
      {/* Doctor Info */}
      <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{doctor.fullName}</h3>
      <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
        {doctor.specialty}
      </div>
      
      {/* Book Button */}
      <button
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
        onClick={onBook}
      >
        Book Appointment →
      </button>
    </div>
  );
}
