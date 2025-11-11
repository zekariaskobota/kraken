import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaSearch, FaChevronDown, FaChevronUp, FaQuestionCircle, FaWallet, FaChartLine, FaShieldAlt, FaExchangeAlt, FaUser, FaLock } from "react-icons/fa";
import Logo from "../../components/Logo/Logo";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategory, setOpenCategory] = useState(null);
  const [openQuestion, setOpenQuestion] = useState(null);

  const categories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <FaUser className="text-2xl" />,
      questions: [
        {
          q: "How do I create an account?",
          a: "Click on the 'Sign Up' button in the top right corner, enter your email address, and follow the verification process. You'll receive a verification code to complete your registration."
        },
        {
          q: "How do I verify my identity?",
          a: "Go to Settings > Identity Verification and upload the required documents (ID, proof of address). Our team will review your submission within 24-48 hours."
        },
        {
          q: "What are the deposit methods available?",
          a: "We support various cryptocurrencies including BTC, ETH, USDT, and more. You can deposit through multiple networks like TRC20, ERC20, and BEP20."
        }
      ]
    },
    {
      id: "trading",
      title: "Trading",
      icon: <FaChartLine className="text-2xl" />,
      questions: [
        {
          q: "How do I place a trade?",
          a: "Navigate to the Trade page, select your trading pair, choose Buy or Sell, enter the amount, and confirm your trade. Make sure you have sufficient balance in your account."
        },
        {
          q: "What are the trading fees?",
          a: "Trading fees vary based on your account level and trading volume. Standard fees start at 0.1% for makers and 0.2% for takers. Check your account settings for your specific fee structure."
        },
        {
          q: "Can I trade on mobile?",
          a: "Yes! Our platform is fully responsive and optimized for mobile devices. You can access all trading features directly from your mobile browser."
        },
        {
          q: "What is demo trading?",
          a: "Demo trading allows you to practice trading with virtual funds. It's perfect for learning how to trade without risking real money. Access it from the Demo Trading section."
        }
      ]
    },
    {
      id: "wallet",
      title: "Wallet & Funds",
      icon: <FaWallet className="text-2xl" />,
      questions: [
        {
          q: "How do I deposit funds?",
          a: "Go to the Deposit page, select your cryptocurrency, choose the network, and follow the instructions. You'll receive a deposit address and QR code. Send funds to that address."
        },
        {
          q: "How long do deposits take?",
          a: "Deposit times vary by network. TRC20 deposits are usually instant, while ERC20 can take 5-20 minutes depending on network congestion. All deposits require admin approval."
        },
        {
          q: "How do I withdraw funds?",
          a: "Navigate to the Withdraw page, select your cryptocurrency and network, enter the withdrawal address and amount, and confirm. Withdrawals are processed after admin approval."
        },
        {
          q: "Are there withdrawal fees?",
          a: "Yes, withdrawal fees vary by cryptocurrency and network. Fees are displayed before you confirm your withdrawal. These fees cover network transaction costs."
        }
      ]
    },
    {
      id: "security",
      title: "Security",
      icon: <FaShieldAlt className="text-2xl" />,
      questions: [
        {
          q: "How do I secure my account?",
          a: "Enable two-factor authentication (2FA), use a strong unique password, never share your login credentials, and enable email notifications for account activity."
        },
        {
          q: "What should I do if my account is compromised?",
          a: "Immediately change your password, enable 2FA if not already enabled, and contact our support team. We'll help secure your account and investigate any unauthorized activity."
        },
        {
          q: "How is my data protected?",
          a: "We use industry-standard encryption, secure servers, and follow best practices for data protection. Your personal and financial information is encrypted and stored securely."
        }
      ]
    },
    {
      id: "account",
      title: "Account Settings",
      icon: <FaLock className="text-2xl" />,
      questions: [
        {
          q: "How do I change my password?",
          a: "Go to Settings > Security > Change Password. Enter your current password and your new password. Make sure your new password is strong and unique."
        },
        {
          q: "How do I update my profile?",
          a: "Navigate to Settings and update your personal information. Some changes may require identity verification."
        },
        {
          q: "Can I have multiple accounts?",
          a: "Each user is allowed one account per email address. Creating multiple accounts violates our Terms of Service and may result in account suspension."
        }
      ]
    }
  ];

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.questions.some(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const toggleCategory = (categoryId) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  };

  const toggleQuestion = (questionIndex) => {
    setOpenQuestion(openQuestion === questionIndex ? null : questionIndex);
  };

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-400 mb-8">
            Find answers to common questions and get support
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <div className="space-y-4">
          {filteredCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-teal-500/50 transition-all duration-300"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-teal-400">{category.icon}</div>
                  <h2 className="text-xl font-semibold text-white">
                    {category.title}
                  </h2>
                </div>
                {openCategory === category.id ? (
                  <FaChevronUp className="text-gray-400" />
                ) : (
                  <FaChevronDown className="text-gray-400" />
                )}
              </button>

              {/* Questions */}
              {openCategory === category.id && (
                <div className="px-6 pb-4 space-y-3">
                  {category.questions.map((item, questionIndex) => (
                    <div
                      key={questionIndex}
                      className="bg-gray-900/50 border border-gray-700/50 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleQuestion(`${category.id}-${questionIndex}`)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <FaQuestionCircle className="text-teal-400 mt-1 flex-shrink-0" />
                          <span className="text-gray-300 font-medium">
                            {item.q}
                          </span>
                        </div>
                        {openQuestion === `${category.id}-${questionIndex}` ? (
                          <FaChevronUp className="text-gray-400 ml-2 flex-shrink-0" />
                        ) : (
                          <FaChevronDown className="text-gray-400 ml-2 flex-shrink-0" />
                        )}
                      </button>
                      {openQuestion === `${category.id}-${questionIndex}` && (
                        <div className="px-4 pb-3 pl-11">
                          <p className="text-gray-400 leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Contact Support Section */}
        {filteredCategories.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-400 mb-4">No results found for "{searchQuery}"</p>
            <p className="text-gray-500 text-sm">Try different keywords or contact our support team</p>
          </motion.div>
        )}

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center"
        >
          <h3 className="text-2xl font-semibold text-white mb-4">
            Still need help?
          </h3>
          <p className="text-gray-400 mb-6">
            Our support team is here to assist you 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@krakentrade.com"
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-all duration-300"
            >
              Contact Support
            </a>
            <Link
              to="/"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpCenter;

