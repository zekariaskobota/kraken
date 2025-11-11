import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Logo from "../Logo/Logo";

const TermsOfService = () => {
  const sections = [
    {
      title: "Introduction",
      content: "Welcome to Kraken! By using our platform, you agree to the following Terms of Service. Please read them carefully."
    },
    {
      title: "Acceptance of Terms",
      content: "By accessing and using the Kraken platform, you agree to abide by these Terms of Service. If you do not agree, please do not use the service."
    },
    {
      title: "User Responsibilities",
      items: [
        "You are responsible for maintaining the confidentiality of your account and login details.",
        "You agree to use the platform in compliance with all applicable laws and regulations.",
        "You must notify us immediately if your account is compromised or accessed without authorization."
      ]
    },
    {
      title: "Limitations of Liability",
      content: "Kraken is not responsible for any loss or damage resulting from the use of our platform, including but not limited to technical failures, cyberattacks, or incorrect information."
    },
    {
      title: "Termination of Service",
      content: "We may terminate or suspend your account at any time if you violate these Terms of Service or for any other reason. Upon termination, your access to the platform will be revoked."
    },
    {
      title: "Changes to Terms",
      content: "Kraken reserves the right to modify these Terms of Service at any time. We will notify users of significant changes by updating the \"Last updated\" date and posting the new terms."
    },
    {
      title: "Governing Law",
      content: "These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which Kraken is registered."
    },
    {
      title: "Contact Us",
      content: "If you have any questions regarding these Terms of Service, please contact us at:",
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
            Terms of Service
          </h1>
          <p className="text-lg text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>

        {/* Terms Sections */}
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

export default TermsOfService;
