import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useLanguage } from "../contexts/LanguageContext";

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const { isMarathi, toggleLanguage } = useLanguage();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMessNameModal, setShowMessNameModal] = useState(false);
  const [messName, setMessName] = useState("");
  const [currentUserData, setCurrentUserData] = useState(null);
  const navigate = useNavigate();

  async function handleGoogleLogin() {
    try {
      setError("");
      setLoading(true);
      const result = await loginWithGoogle();
      const user = result.user;
      
      // Check if mess owner data exists
      const messOwnerRef = doc(db, "messOwners", user.uid);
      const messOwnerSnap = await getDoc(messOwnerRef);
      
      if (!messOwnerSnap.exists()) {
        // First time login - show mess name modal
        setCurrentUserData(user);
        setShowMessNameModal(true);
        setLoading(false);
      } else {
        // Existing user - redirect to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(isMarathi ? "लॉगिन करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा." : "Login failed. Please try again."); // Failed to login. Please try again.
      setLoading(false);
    }
  }

  async function handleMessNameSubmit(e) {
    e.preventDefault();
    if (!messName.trim()) {
      setError(isMarathi ? "कृपया मेसचे नाव प्रविष्ट करा" : "Please enter mess name");
      return;
    }

    try {
      setLoading(true);
      // Save mess owner data
      await setDoc(doc(db, "messOwners", currentUserData.uid), {
        messName: messName.trim(),
        ownerEmail: currentUserData.email,
        ownerName: currentUserData.displayName,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setShowMessNameModal(false);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(isMarathi ? "मेसचे नाव जतन करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा." : "Failed to save mess name. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F3EF] via-[#FAFAF7] to-[#F5E6C3] px-4">
      {/* Language Toggle Button */}
      <button
        onClick={toggleLanguage}
        className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-white hover:bg-[#E8F3EF] text-[#0F4C3A] font-semibold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-[#0F4C3A]/10 hover:border-[#0F4C3A]/30"
        aria-label="Toggle Language"
      >
        <span className="material-icons-outlined text-lg">language</span>
        <span className="text-sm">{isMarathi ? "English" : "मराठी"}</span>
      </button>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 space-y-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="MessFlow Logo" 
              className="h-20 w-auto"
            />
          </div>
          <h2 className="text-4xl font-bold text-[#073327]">
            {isMarathi ? "मेस मालक लॉगिन" : "Mess Owner Login"}
          </h2>
          <p className="mt-3 text-base text-[#2E2E2E]">
            {isMarathi 
              ? "तुमचा मेस व्यवसाय व्यवस्थापित करण्यासाठी लॉगिन करा"
              : "Login to manage your mess business"}
          </p>
        </div>

        {error && (
          <div className="bg-status-expired/10 border-2 border-status-expired/20 text-status-expired px-4 py-4 rounded-xl relative flex items-start gap-3" role="alert">
            <span className="material-icons-outlined text-xl flex-shrink-0 mt-0.5">error_outline</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex justify-center items-center gap-3 bg-white border-2 border-gray-200 text-[#2E2E2E] hover:bg-gray-50 hover:border-[#0F4C3A]/30 font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google logo" 
            className="w-6 h-6"
          />
          {loading 
            ? (isMarathi ? "लॉगिन होत आहे..." : "Logging in...") 
            : (isMarathi ? "Google ने लॉगिन करा" : "Login with Google")}
        </button>

        {/* Mess Name Modal */}
        {showMessNameModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100 animate-in fade-in duration-200">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#E8F3EF] mb-3">
                  <span className="material-icons-outlined text-[#0F4C3A] text-2xl">store</span>
                </div>
                <h3 className="text-2xl font-bold text-[#073327]">
                  {isMarathi ? "तुमच्या मेसचे नाव प्रविष्ट करा" : "Enter Your Mess Name"}
                </h3>
              </div>
              <form onSubmit={handleMessNameSubmit} className="space-y-6">
                <div>
                  <label htmlFor="messName" className="block text-sm font-semibold text-[#073327] mb-2">
                    {isMarathi ? "मेसचे नाव" : "Mess Name"}
                  </label>
                  <input
                    type="text"
                    id="messName"
                    value={messName}
                    onChange={(e) => setMessName(e.target.value)}
                    className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm focus:border-[#0F4C3A] focus:ring-2 focus:ring-[#0F4C3A]/20 focus:outline-none sm:text-base transition-all"
                    placeholder={isMarathi ? "उदा: श्री गणेश मेस" : "e.g., Shri Ganesh Mess"}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-[#0F4C3A] to-[#073327] hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      {isMarathi ? "जतन करत आहे..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <span className="material-icons-outlined text-xl">check_circle</span>
                      {isMarathi ? "जतन करा" : "Save"}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
