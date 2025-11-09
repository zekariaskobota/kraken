import React from "react";
import { motion } from "framer-motion";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white pb-10" style={{width:"100vw"}}>
      {/* Header */}
      <header className="text-left py-12">
        <h3 className="text-4xl text-center font-bold text-yellow-400">Terms of Service</h3>
        <p className="text-lg text-center text-gray-400 mt-2">Last updated: March 2025</p>
      </header>

      {/* Terms Sections */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section 1: Introduction */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left"
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Introduction</h2>
          <p className="text-gray-400">
            Welcome to CryptoTrade! By using our platform, you agree to the following Terms of Service. Please read them carefully.
          </p>
        </motion.section>

        {/* Section 2: Accepting Terms */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left"
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Acceptance of Terms</h2>
          <p className="text-gray-400">
            By accessing and using the CryptoTrade platform, you agree to abide by these Terms of Service. If you do not agree, please do not use the service.
          </p>
        </motion.section>

        {/* Section 3: User Responsibilities */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left"
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">User Responsibilities</h2>
          <ul className="text-gray-400 list-disc pl-5">
            <li className="text-lg">You are responsible for maintaining the confidentiality of your account and login details.</li>
            <li className="text-lg">You agree to use the platform in compliance with all applicable laws and regulations.</li>
            <li className="text-lg">You must notify us immediately if your account is compromised or accessed without authorization.</li>
          </ul>
        </motion.section>

        {/* Section 4: Limitations of Liability */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left"
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Limitations of Liability</h2>
          <p className="text-gray-400">
            CryptoTrade is not responsible for any loss or damage resulting from the use of our platform, including but not limited to technical failures, cyberattacks, or incorrect information.
          </p>
        </motion.section>

        {/* Section 5: Termination of Service */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left"
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Termination of Service</h2>
          <p className="text-gray-400">
            We may terminate or suspend your account at any time if you violate these Terms of Service or for any other reason. Upon termination, your access to the platform will be revoked.
          </p>
        </motion.section>

        {/* Section 6: Changes to Terms */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left"
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Changes to Terms</h2>
          <p className="text-gray-400">
            CryptoTrade reserves the right to modify these Terms of Service at any time. We will notify users of significant changes by updating the "Last updated" date and posting the new terms.
          </p>
        </motion.section>

        {/* Section 7: Governing Law */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left"
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Governing Law</h2>
          <p className="text-gray-400">
            These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which CryptoTrade is registered.
          </p>
        </motion.section>

        {/* Section 8: Contact Us */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 text-left"
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Contact Us</h2>
          <p className="text-gray-400">
            If you have any questions regarding these Terms of Service, please contact us at:
          </p>
          <p className="text-gray-400">
            Email: <a href="mailto:support@krakentrade.com" className="text-yellow-400">support@krakentrade.com</a>
          </p>
        </motion.section>
      </div>
    </div>
  );
};

export default TermsOfService;
