import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-10 mb-10">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">Privacy Policy</h1>
      <p className="text-gray-700 mb-4">
        At OptiDoc, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
      </p>
      <ul className="list-disc pl-6 text-gray-600 mb-4">
        <li>We only collect information necessary to provide our services.</li>
        <li>Your data is stored securely and is never shared with third parties without your consent.</li>
        <li>We use industry-standard security measures to protect your information.</li>
        <li>You can access and manage your personal data at any time.</li>
      </ul>
      <p className="text-gray-700 mb-4">
        If you have any questions about our privacy practices, please contact us at <a href="mailto:omkapadiya47@gmail.com" className="text-blue-500 underline">omkapadiya47@gmail.com</a>.
      </p>
      <div className="text-center mt-10">
        <span className="text-gray-400">© 2024 OptiDoc. All rights reserved.</span>
      </div>
    </div>
  );
}
