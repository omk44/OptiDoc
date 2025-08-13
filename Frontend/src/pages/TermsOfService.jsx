import React from "react";

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-10 mb-10">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">Terms of Service</h1>
      <p className="text-gray-700 mb-4">
        By using OptiDoc, you agree to the following terms and conditions:
      </p>
      <ul className="list-disc pl-6 text-gray-600 mb-4">
        <li>You must provide accurate and complete information when registering.</li>
        <li>Use the platform only for lawful purposes.</li>
        <li>Do not share your account credentials with others.</li>
        <li>We reserve the right to update these terms at any time.</li>
      </ul>
      <p className="text-gray-700 mb-4">
        For any questions regarding these terms, please contact us at <a href="mailto:omkapadiya47@gmail.com" className="text-blue-500 underline">omkapadiya47@gmail.com</a>.
      </p>
      <div className="text-center mt-10">
        <span className="text-gray-400">© 2024 OptiDoc. All rights reserved.</span>
      </div>
    </div>
  );
}
