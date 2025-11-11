import React, { useState, useEffect } from "react";
import {
  FaUpload,
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaIdCard,
  FaPassport,
  FaCreditCard,
  FaLock,
  FaEye,
  FaInfoCircle,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import { identityAPI } from "../../services/apiService";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../utils/toast";

const Identity = () => {
  const [documentType, setDocumentType] = useState("Identity Card");
  const [realName, setRealName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [status, setStatus] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIdentityStatus = async () => {
      try {
        const data = await identityAPI.getStatus();
        if (data.identity) {
          setStatus(data.identity.status);
        }
      } catch (error) {
        // Error handling
      }
    };

    fetchIdentityStatus();
  }, []);

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      if (type === "front") {
        setFrontImage(file);
        setFrontPreview(URL.createObjectURL(file));
      } else {
        setBackImage(file);
        setBackPreview(URL.createObjectURL(file));
      }
    }
  };

  const removeImage = (type) => {
    if (type === "front") {
      setFrontImage(null);
      setFrontPreview(null);
    } else {
      setBackImage(null);
      setBackPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status === "Pending" || status === "Verified") {
      showToast.info("You have already uploaded your identity document!");
      return;
    }

    if (!frontImage || !backImage) {
      showToast.warning("Please upload both front and back images of your document");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("realName", realName);
    formData.append("documentNumber", documentNumber);
    formData.append("status", "Pending");
    formData.append("frontImage", frontImage);
    formData.append("backImage", backImage);

    try {
      await identityAPI.verifyIdentity(formData);
      setStatus("Pending");
      showToast.success("Your identity verification request has been submitted successfully. We'll review it within 24-48 hours.");
    } catch (error) {
      showToast.error(error.message || "Failed to upload identity document");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Verified":
        return {
          icon: <FaCheckCircle className="text-teal-400" />,
          title: "Identity Verified",
          description: "Your identity has been successfully verified. You can now access all trading features.",
          color: "from-gray-800/50 to-gray-900/50",
          borderColor: "border-gray-700",
          badgeColor: "bg-gray-800/50 text-teal-400 border-gray-700",
        };
      case "Pending":
        return {
          icon: <FaClock className="text-teal-400" />,
          title: "Verification Pending",
          description: "Your identity verification is currently being reviewed. We'll notify you once it's complete (usually within 24-48 hours).",
          color: "from-gray-800/50 to-gray-900/50",
          borderColor: "border-gray-700",
          badgeColor: "bg-gray-800/50 text-teal-400 border-gray-700",
        };
      default:
        return {
          icon: <FaTimesCircle className="text-gray-400" />,
          title: "Not Verified",
          description: "Please complete identity verification to access all trading features and increase your account security.",
          color: "from-gray-800/50 to-gray-900/50",
          borderColor: "border-gray-700",
          badgeColor: "bg-gray-800/50 text-gray-400 border-gray-700",
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  const documentTypes = [
    {
      value: "Identity Card",
      label: "Identity Card",
      icon: <FaIdCard />,
      description: "National ID or Government-issued ID",
    },
    {
      value: "Passport",
      label: "Passport",
      icon: <FaPassport />,
      description: "Valid passport document",
    },
    {
      value: "Driver's License",
      label: "Driver's License",
      icon: <FaCreditCard />,
      description: "Valid driver's license",
    },
  ];

  const verificationSteps = [
    { step: 1, label: "Document Type", completed: documentType !== "" },
    { step: 2, label: "Personal Info", completed: realName !== "" && documentNumber !== "" },
    { step: 3, label: "Upload Documents", completed: frontImage !== null && backImage !== null },
  ];

  const completedSteps = verificationSteps.filter((s) => s.completed).length;
  const progress = (completedSteps / verificationSteps.length) * 100;

  if (status === "Pending" || status === "Verified") {
    return (
      <div className="w-full max-w-full p-0 box-border overflow-x-hidden">
        {/* Status Card */}
        <div
          className={`bg-gradient-to-br ${statusConfig.color} border ${statusConfig.borderColor} rounded-2xl p-6 sm:p-8 mb-6`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 text-4xl sm:text-5xl">
              {statusConfig.icon}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{statusConfig.title}</h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-md mb-4">{statusConfig.description}</p>
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${statusConfig.badgeColor}`}
            >
              {statusConfig.icon}
              <span>Status: {status}</span>
            </div>
          </div>
        </div>

        {/* Security Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center text-teal-400">
                <FaLock />
              </div>
              <h3 className="text-sm font-semibold text-white">Enhanced Security</h3>
            </div>
            <p className="text-xs text-gray-400">Your account is protected with verified identity</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center text-teal-400">
                <FaShieldAlt />
              </div>
              <h3 className="text-sm font-semibold text-white">Full Access</h3>
            </div>
            <p className="text-xs text-gray-400">Access all trading features and higher limits</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center text-teal-400">
                <FaCheckCircle />
              </div>
              <h3 className="text-sm font-semibold text-white">Compliance</h3>
            </div>
            <p className="text-xs text-gray-400">Meet regulatory requirements for trading</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full p-0 box-border overflow-x-hidden">
      {/* Header Section */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-700/50 flex items-center justify-center text-3xl sm:text-4xl text-teal-400 flex-shrink-0">
            <FaShieldAlt />
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Identity Verification
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Verify your identity to unlock full trading features and enhance account security
            </p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-white">Verification Progress</h3>
          <span className="text-xs text-gray-400">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-teal-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between">
          {verificationSteps.map((step) => (
            <div key={step.step} className="flex flex-col items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step.completed
                    ? "bg-gradient-to-r from-teal-400 to-cyan-400 text-white"
                    : "bg-slate-700/50 text-gray-500"
                }`}
              >
                {step.completed ? <FaCheck /> : step.step}
              </div>
              <span className="text-xs text-gray-400 text-center">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Why Verify Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center text-teal-400 flex-shrink-0">
              <FaInfoCircle />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Why Verify?</h3>
              <p className="text-xs text-gray-400">
                Identity verification helps protect your account and enables higher trading limits, faster withdrawals, and access to advanced features.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center text-teal-400 flex-shrink-0">
              <FaLock />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Secure & Private</h3>
              <p className="text-xs text-gray-400">
                Your documents are encrypted and stored securely. We use industry-standard security measures to protect your information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Type Selection */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
              1
            </span>
            Select Document Type
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {documentTypes.map((doc) => (
              <button
                key={doc.value}
                type="button"
                onClick={() => setDocumentType(doc.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                  documentType === doc.value
                    ? "border-teal-500 bg-teal-500/10"
                    : "border-gray-700 bg-gray-900/50 hover:border-teal-500/50"
                }`}
              >
                <div className={`text-2xl mb-2 ${documentType === doc.value ? "text-teal-400" : "text-gray-500"}`}>
                  {doc.icon}
                </div>
                <div className={`text-sm font-semibold mb-1 ${documentType === doc.value ? "text-white" : "text-gray-400"}`}>
                  {doc.label}
                </div>
                <div className="text-xs text-gray-500">{doc.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
              2
            </span>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-medium">Full Name (as on document)</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-gray-900/70 placeholder:text-gray-600"
                placeholder="Enter your full name"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-medium">Document Number</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-gray-900/70 placeholder:text-gray-600"
                placeholder="Enter document number"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
              3
            </span>
            Upload Documents
          </h3>
          <div className="mb-4 p-3 bg-gray-700/50 border border-gray-600 rounded-lg">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-teal-400 text-sm mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-300">
                <strong>Important:</strong> Ensure documents are clear, well-lit, and all information is visible. Blurry or incomplete documents will be rejected.
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Front Side */}
            <div className="relative">
              <input
                type="file"
                className="absolute w-0 h-0 opacity-0"
                id="front-upload"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "front")}
                required
              />
              <label
                htmlFor="front-upload"
                className={`block w-full aspect-[4/3] bg-gray-900/50 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 overflow-hidden relative group ${
                  frontPreview ? "border-teal-500/50" : "border-gray-700 hover:border-teal-500"
                }`}
              >
                {frontPreview ? (
                  <>
                    <img src={frontPreview} alt="Front" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage("front");
                        }}
                        className="px-3 py-1.5 bg-red-500/80 text-white rounded-lg text-xs font-medium hover:bg-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400 p-4">
                    <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-xl">
                      <FaUpload />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium block mb-1">Front Side</span>
                      <span className="text-xs text-gray-500">Click to upload or drag & drop</span>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Back Side */}
            <div className="relative">
              <input
                type="file"
                className="absolute w-0 h-0 opacity-0"
                id="back-upload"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "back")}
                required
              />
              <label
                htmlFor="back-upload"
                className={`block w-full aspect-[4/3] bg-gray-900/50 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 overflow-hidden relative group ${
                  backPreview ? "border-teal-500/50" : "border-gray-700 hover:border-teal-500"
                }`}
              >
                {backPreview ? (
                  <>
                    <img src={backPreview} alt="Back" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage("back");
                        }}
                        className="px-3 py-1.5 bg-red-500/80 text-white rounded-lg text-xs font-medium hover:bg-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400 p-4">
                    <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-xl">
                      <FaUpload />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium block mb-1">Back Side</span>
                      <span className="text-xs text-gray-500">Click to upload or drag & drop</span>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-6 py-4 rounded-xl text-sm sm:text-base font-semibold text-white border-none cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          disabled={loading || !frontImage || !backImage || !realName || !documentNumber}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <FaShieldAlt />
              <span>Submit Verification</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Identity;
