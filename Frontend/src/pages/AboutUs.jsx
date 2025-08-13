import React from "react";

export default function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-10 mb-10">
      <h1 className="text-4xl font-bold text-blue-700 mb-6 text-center">About OptiDoc</h1>
      <p className="text-lg text-gray-700 mb-6 text-center">
        OptiDoc is India’s most trusted digital platform for scheduling doctor appointments from anywhere, anytime. Our mission is to make healthcare accessible, fast, and reliable for everyone.
      </p>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-600 mb-2">Who We Are</h2>
        <p className="text-gray-600">
          Founded by a passionate team of healthcare and technology professionals, OptiDoc bridges the gap between patients and doctors using cutting-edge technology. We believe in patient-first healthcare, data security, and seamless digital experiences.
        </p>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-600 mb-2">Our Vision</h2>
        <p className="text-gray-600">
          To empower every individual in India to access quality healthcare with just a few clicks. We strive to build a healthier nation by connecting patients with the best doctors, reducing wait times, and ensuring transparency in healthcare services.
        </p>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-600 mb-2">Why Choose OptiDoc?</h2>
        <ul className="list-disc pl-6 text-gray-600">
          <li>Book appointments with top-rated doctors across specialties</li>
          <li>Fast, secure, and reliable platform</li>
          <li>Patient data privacy and security as our top priority</li>
          <li>24/7 access to your appointment history</li>
          <li>Friendly support and easy-to-use interface</li>
        </ul>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-600 mb-2">Contact Us</h2>
        <p className="text-gray-600">
          Email: <a href="mailto:omkapadiya47@gmail.com" className="text-blue-500 underline">omkapadiya47@gmail.com</a><br/>
          Phone: <a href="tel:+916356840416" className="text-blue-500 underline">+91-6356840416</a><br/>
          Address: Alpha Complex, City Bazar, Near Zin Complex, Vadodara, Gujarat 390001
        </p>
      </div>
      <div className="text-center mt-10">
        <span className="text-gray-400">© 2024 OptiDoc. All rights reserved.</span>
      </div>
    </div>
  );
}
