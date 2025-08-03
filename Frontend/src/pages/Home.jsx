// src/pages/Home.jsx
import React from 'react'
import DoctorCard from '../components/DoctorCard'
import { useNavigate } from 'react-router-dom'

import doc1 from '../assets/doctor1.png'
import doc2 from '../assets/doctor2.png'
import doc3 from '../assets/doctor3.png'

const doctors = [
  {
    id: 'd1',
    name: 'Dr. Rakesh Mehta',
    image: doc1,
    specialty: 'Cardiologist',
    hospital: 'Apollo Hospital, Delhi',
    available: true,
  },
  {
    id: 'd2',
    name: 'Dr. Anita Shah',
    image: doc2,
    specialty: 'Neurologist',
    hospital: 'Fortis Hospital, Mumbai',
    available: false,
  },
  {
    id: 'd3',
    name: 'Dr. Vivek Jain',
    image: doc3,
    specialty: 'Orthopedic Surgeon',
    hospital: 'AIIMS, Delhi',
    available: true,
  },
]

export default function Home() {
  const navigate = useNavigate()

  const handleBook = (doctor) => {
    localStorage.setItem('selectedDoctor', JSON.stringify(doctor))
    navigate('/book')
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
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onBook={() => handleBook(doctor)} // <-- Pass onBook like AllDoctors.jsx
            />
          ))}
        </div>
      </div>
    </div>
  )
}
