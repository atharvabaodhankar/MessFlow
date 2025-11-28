import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Login() {
  const { loginWithGoogle } = useAuth();
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
      setError("लॉगिन करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा."); // Failed to login. Please try again.
      setLoading(false);
    }
  }

  async function handleMessNameSubmit(e) {
    e.preventDefault();
    if (!messName.trim()) {
      setError("कृपया मेसचे नाव प्रविष्ट करा");
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
      setError("मेसचे नाव जतन करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">मेस मालक लॉगिन</h2>
          <p className="mt-2 text-sm text-gray-600">
            तुमचा मेस व्यवसाय व्यवस्थापित करण्यासाठी लॉगिन करा
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex justify-center items-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors shadow-sm"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google logo" 
            className="w-6 h-6"
          />
          {loading ? "लॉगिन होत आहे..." : "Google ने लॉगिन करा"}
        </button>

        {/* Mess Name Modal */}
        {showMessNameModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                तुमच्या मेसचे नाव प्रविष्ट करा
              </h3>
              <form onSubmit={handleMessNameSubmit} className="space-y-4">
                <div>
                  <label htmlFor="messName" className="block text-sm font-medium text-gray-700">
                    मेसचे नाव
                  </label>
                  <input
                    type="text"
                    id="messName"
                    value={messName}
                    onChange={(e) => setMessName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm border p-2"
                    placeholder="उदा: श्री गणेश मेस"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50"
                >
                  {loading ? "जतन करत आहे..." : "जतन करा"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
