import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Logo from "../Logo/Logo";

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Introduction",
      content: "Welcome to Kraken. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform."
    },
    {
      title: "Information We Collect",
      items: [
        "Personal Identification Information: name, email, phone number.",
        "Financial Information: transaction data, account details, payment methods.",
        "Usage Data: IP address, browser type, time spent on platform."
      ]
    },
    {
      title: "How We Use Your Information",
      items: [
        "Process transactions and provide trading services.",
        "Improve our platform and customer support.",
        "Send promotional materials and updates (optional)."
      ]
    },
    {
      title: "Data Security",
      content: "We use state-of-the-art encryption and security measures to protect your personal and financial information from unauthorized access, alteration, or destruction."
    },
    {
      title: "Data Sharing",
      content: "We do not sell or share your personal information with third parties, except in the following cases:",
      items: [
        "To comply with legal obligations or government requests.",
        "To process payments through third-party services (e.g., payment processors).",
        "With our partners and service providers to improve the platform experience."
      ]
    },
    {
      title: "Your Rights",
      items: [
        "Access, update, or delete your personal information.",
        "Opt-out of receiving promotional communications at any time.",
        "Request a copy of the information we hold about you."
      ]
    },
    {
      title: "Cookies and Tracking Technologies",
      content: "We use cookies and other tracking technologies to enhance your experience, analyze usage patterns, and improve the platform. You can control cookie settings through your browser."
    },
    {
      title: "Changes to This Policy",
      content: "We may update this Privacy Policy from time to time. When we do, we will post the updated version on this page with a new \"Last updated\" date. Please review this policy periodically for any changes."
    },
    {
      title: "Contact Us",
      content: "If you have any questions or concerns about this Privacy Policy or how we handle your information, feel free to contact us at:",
      email: "support@krakentrade.com"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] to-[#1a1d29] text-gray-200">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo size="default" showText={true} />
          </Link>
          <Link
            to="/"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-teal-500/10 transition-all duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>

        {/* Policy Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.section
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 md:p-8 hover:border-teal-500/50 transition-all duration-300"
            >
              <h2 className="text-2xl font-semibold text-teal-400 mb-4">
                {section.title}
              </h2>
              
              {section.content && (
                <p className="text-gray-300 leading-relaxed mb-4">
                  {section.content}
                </p>
              )}
              
              {section.items && (
                <ul className="text-gray-300 list-disc pl-6 space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              
              {section.email && (
                <p className="text-gray-300 mt-4">
                  Email:{" "}
                  <a
                    href={`mailto:${section.email}`}
                    className="text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    {section.email}
                  </a>
                </p>
              )}
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
