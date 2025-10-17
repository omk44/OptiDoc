import React from "react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-lg md:text-xl opacity-90">
            Please read these terms carefully before using OptiDoc
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Agreement to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By using OptiDoc, you agree to be bound by the following terms and conditions. If you do not agree with these terms, please do not use our platform.
              </p>
            </div>
          </div>
        </div>

        {/* Main Terms */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Key Terms & Conditions</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Accurate Information</h3>
                <p className="text-gray-600">
                  You must provide accurate and complete information when registering on our platform. Any false or misleading information may result in account suspension or termination.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Lawful Use Only</h3>
                <p className="text-gray-600">
                  Use the platform only for lawful purposes. You may not use OptiDoc in any way that violates applicable local, national, or international laws or regulations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Account Security</h3>
                <p className="text-gray-600">
                  Do not share your account credentials with others. You are responsible for maintaining the confidentiality of your password and account information.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Appointment Responsibility</h3>
                <p className="text-gray-600">
                  You are responsible for attending scheduled appointments or canceling them in a timely manner. Repeated no-shows may affect your ability to book future appointments.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold">5</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Medical Disclaimer</h3>
                <p className="text-gray-600">
                  OptiDoc is a booking platform only. We do not provide medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers with any questions regarding medical conditions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold">6</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Updates to Terms</h3>
                <p className="text-gray-600">
                  We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms. We will notify users of significant changes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold">7</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Termination</h3>
                <p className="text-gray-600">
                  We reserve the right to terminate or suspend your account at any time for violations of these terms or for any other reason at our discretion.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
          <p className="leading-relaxed opacity-90">
            OptiDoc shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service, including but not limited to damages for loss of profits, goodwill, data, or other intangible losses.
          </p>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Questions About Terms?</h2>
              <p className="text-gray-600 mb-4">
                For any questions or concerns regarding these terms, please don't hesitate to contact us:
              </p>
              <a 
                href="mailto:omkapadiya47@gmail.com" 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                omkapadiya47@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 mb-2">Last Updated: January 2024</p>
          <p className="text-gray-500">© 2024 OptiDoc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
