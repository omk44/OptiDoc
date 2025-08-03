// src/data/doctors.js

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

const doctors = [
  // Cardiologists (1–4)
  {
    id: 1,
    name: "Dr. Aarav Mehta",
    specialty: "Cardiologist",
    hospital: "City Heart Hospital",
    image: doc1,
    available: true,
  },
  {
    id: 2,
    name: "Dr. Neha Shah",
    specialty: "Cardiologist",
    hospital: "Metro Health Care",
    image: doc2,
    available: true,
  },
  {
    id: 3,
    name: "Dr. Rakesh Kumar",
    specialty: "Cardiologist",
    hospital: "Apollo Hospitals",
    image: doc3,
    available: true,
  },
  {
    id: 4,
    name: "Dr. Swati Patel",
    specialty: "Cardiologist",
    hospital: "Heart Wellness Clinic",
    image: doc4,
    available: true,
  },

  // Neurologists (5–8)
  {
    id: 5,
    name: "Dr. Anil Joshi",
    specialty: "Neurologist",
    hospital: "Neuro Care Center",
    image: doc5,
    available: true,
  },
  {
    id: 6,
    name: "Dr. Priya Menon",
    specialty: "Neurologist",
    hospital: "Brain Health Institute",
    image: doc6,
    available: true,
  },
  {
    id: 7,
    name: "Dr. Vikram Sinha",
    specialty: "Neurologist",
    hospital: "NeuroLife Hospital",
    image: doc7,
    available: true,
  },
  {
    id: 8,
    name: "Dr. Kavita Iyer",
    specialty: "Neurologist",
    hospital: "Mind Care Hospital",
    image: doc8,
    available: true,
  },

  // Dermatologists (9–12)
  {
    id: 9,
    name: "Dr. Rohit Jain",
    specialty: "Dermatologist",
    hospital: "Skin Glow Clinic",
    image: doc9,
    available: true,
  },
  {
    id: 10,
    name: "Dr. Meera Desai",
    specialty: "Dermatologist",
    hospital: "Derma Health Center",
    image: doc10,
    available: true,
  },
  {
    id: 11,
    name: "Dr. Ankit Rana",
    specialty: "Dermatologist",
    hospital: "Radiance Skin Care",
    image: doc11,
    available: true,
  },
  {
    id: 12,
    name: "Dr. Sneha Kapoor",
    specialty: "Dermatologist",
    hospital: "Skin Bliss Hospital",
    image: doc12,
    available: true,
  },
];

export default doctors;
