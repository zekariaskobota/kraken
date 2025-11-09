import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20" style={{width:"100vw"}}>
      {/* Header */}
      <header className="text-left py-12">
        <h3 className="text-4xl text-center font-bold text-yellow-400">Privacy Policy</h3>
        <p className="text-lg text-center text-gray-400 mt-2">Last updated: March 2025</p>
      </header>

      {/* Policy Sections */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Introduction</h2>
          <p className="text-gray-400">
            Welcome to CryptoTrade. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.
          </p>
        </section>

        <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Information We Collect</h2>
          <ul className="text-gray-400 list-disc pl-5">
            <li className="text-lg">Personal Identification Information: name, email, phone number.</li>
            <li className="text-lg">Financial Information: transaction data, account details, payment methods.</li>
            <li className="text-lg">Usage Data: IP address, browser type, time spent on platform.</li>
          </ul>
        </section>

        <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">How We Use Your Information</h2>
          <p className="text-gray-400">
            We use the information collected to:
          </p>
          <ul className="list-disc pl-5">
            <li className="text-lg">Process transactions and provide trading services.</li>
            <li className="text-lg">Improve our platform and customer support.</li>
            <li className="text-lg">Send promotional materials and updates (optional).</li>
          </ul>
        </section>

        <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Data Security</h2>
          <p className="text-gray-400">
            We use state-of-the-art encryption and security measures to protect your personal and financial information from unauthorized access, alteration, or destruction.
          </p>
        </section>

        <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Data Sharing</h2>
          <p className="text-gray-400">
            We do not sell or share your personal information with third parties, except in the following cases:
          </p>
          <ul className="text-gray-400 list-disc pl-5">
            <li className="text-lg">To comply with legal obligations or government requests.</li>
            <li className="text-lg">To process payments through third-party services (e.g., payment processors).</li>
            <li className="text-lg">With our partners and service providers to improve the platform experience.</li>
          </ul>
        </section>

        <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Your Rights</h2>
          <p className="text-gray-400">
            You have the right to:
          </p>
          <ul className="text-gray-400 list-disc pl-5">
            <li className="text-lg">Access, update, or delete your personal information.</li>
            <li className="text-lg">Opt-out of receiving promotional communications at any time.</li>
            <li className="text-lg">Request a copy of the information we hold about you.</li>
          </ul>
        </section>

        <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Cookies and Tracking Technologies</h2>
          <p className="text-gray-400">
            We use cookies and other tracking technologies to enhance your experience, analyze usage patterns, and improve the platform. You can control cookie settings through your browser.
          </p>
        </section>

        <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Changes to This Policy</h2>
          <p className="text-gray-400">
            We may update this Privacy Policy from time to time. When we do, we will post the updated version on this page with a new "Last updated" date. Please review this policy periodically for any changes.
          </p>
        </section>

        <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Contact Us</h2>
          <p className="text-gray-400">
            If you have any questions or concerns about this Privacy Policy or how we handle your information, feel free to contact us at:
          </p>
          <p className="text-gray-400">
            Email: <a href="mailto:support@krakentrade.com" className="text-yellow-400">support@krakentrade.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
