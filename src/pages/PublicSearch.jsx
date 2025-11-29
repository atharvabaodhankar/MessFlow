import React, { useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

export default function PublicSearch() {
  const { isMarathi, toggleLanguage } = useLanguage();
  const [mobile, setMobile] = useState("");
  const [customer, setCustomer] = useState(null);
  const [messName, setMessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCustomer(null);
    setMessName("");

    try {
      const q = query(collection(db, "customers"), where("mobile", "==", mobile));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError(isMarathi ? "ग्राहक सापडला नाही. कृपया मोबाईल नंबर तपासा." : "Customer not found. Please check the mobile number.");
      } else {
        // Assuming mobile is unique or taking the first match
        const docData = querySnapshot.docs[0];
        const customerData = { id: docData.id, ...docData.data() };
        setCustomer(customerData);
        
        // Fetch mess name
        if (customerData.messId) {
          const messOwnerRef = doc(db, "messOwners", customerData.messId);
          const messOwnerSnap = await getDoc(messOwnerRef);
          if (messOwnerSnap.exists()) {
            setMessName(messOwnerSnap.data().messName || "");
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError(isMarathi ? "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा." : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F3EF] via-[#FAFAF7] to-[#F5E6C3] flex flex-col justify-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      {/* Language Toggle Button */}
      <button
        onClick={toggleLanguage}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2 bg-white hover:bg-[#E8F3EF] text-[#0F4C3A] font-semibold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-[#0F4C3A]/10 hover:border-[#0F4C3A]/30"
        aria-label="Toggle Language"
      >
        <span className="material-icons-outlined text-lg">language</span>
        <span className="text-sm">{isMarathi ? "English" : "मराठी"}</span>
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <img 
            src="/logo.png" 
            alt="MessFlow Logo" 
            className="h-20 w-auto"
          />
        </div>
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#073327]">
          {isMarathi ? "मेस सबस्क्रिप्शन तपासा" : "Check Mess Subscription"}
        </h2>
        <p className="mt-2 sm:mt-3 text-center text-sm sm:text-base text-[#2E2E2E] px-4">
          {isMarathi 
            ? "तुमचा मोबाईल नंबर टाकून तुमच्या मेसची माहिती मिळवा"
            : "Enter your mobile number to get your mess information"}
        </p>
      </div>

      <div className="mt-6 sm:mt-10 mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:py-10 sm:px-12 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
          <form className="space-y-6" onSubmit={handleSearch}>
            <div>
              <label htmlFor="mobile" className="block text-sm font-semibold text-[#073327] mb-2">
                {isMarathi ? "मोबाईल नंबर" : "Mobile Number"}
              </label>
              <div className="mt-1">
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="block w-full appearance-none rounded-xl border-2 border-gray-200 px-4 py-3 placeholder-gray-400 shadow-sm focus:border-[#0F4C3A] focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]/20 sm:text-base transition-all"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-[#0F4C3A] to-[#073327] py-3.5 px-4 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    {isMarathi ? "शोधत आहे..." : "Searching..."}
                  </>
                ) : (
                  <>
                    <span className="material-icons-outlined text-xl">search</span>
                    {isMarathi ? "तपासा" : "Check"}
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 bg-status-expired/10 border-2 border-status-expired/20 text-status-expired px-4 py-4 rounded-xl relative flex items-start gap-3">
              <span className="material-icons-outlined text-xl flex-shrink-0 mt-0.5">error_outline</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {customer && (
            <div className="mt-8 border-t-2 border-gray-100 pt-8">
              <h3 className="text-xl font-bold leading-6 text-[#073327] mb-6">
                {isMarathi ? "ग्राहक माहिती" : "Customer Information"}
              </h3>
              <dl className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {messName && (
                  <div className="sm:col-span-2 bg-gradient-to-r from-[#E8F3EF] to-[#F5E6C3] rounded-xl p-4 border border-[#0F4C3A]/10">
                    <dt className="text-sm font-semibold text-[#073327]/70 mb-1">
                      {isMarathi ? "मेसचे नाव" : "Mess Name"}
                    </dt>
                    <dd className="text-2xl font-bold text-[#0F4C3A]">{messName}</dd>
                  </div>
                )}
                <div className="sm:col-span-1 bg-gray-50 rounded-xl p-4">
                  <dt className="text-sm font-semibold text-[#073327]/70 mb-1">
                    {isMarathi ? "नाव" : "Name"}
                  </dt>
                  <dd className="text-base font-semibold text-[#2E2E2E]">
                    {customer.nameMarathi || customer.name}
                  </dd>
                  {customer.nameMarathi && customer.nameMarathi !== customer.name && (
                    <dd className="text-xs text-gray-500 mt-1">({customer.name})</dd>
                  )}
                </div>
                <div className="sm:col-span-1 bg-gray-50 rounded-xl p-4">
                  <dt className="text-sm font-semibold text-[#073327]/70 mb-2">
                    {isMarathi ? "स्थिती" : "Status"}
                  </dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                      customer.status === 'active' ? 'bg-status-active/10 text-status-active border-2 border-status-active/20' : 
                      customer.status === 'expiring' ? 'bg-status-expiring/10 text-status-expiring border-2 border-status-expiring/20' : 
                      'bg-status-expired/10 text-status-expired border-2 border-status-expired/20'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        customer.status === 'active' ? 'bg-status-active' : 
                        customer.status === 'expiring' ? 'bg-status-expiring' : 
                        'bg-status-expired'
                      }`}></span>
                      {customer.status === 'active' 
                        ? (isMarathi ? 'सक्रिय' : 'Active')
                        : customer.status === 'expiring' 
                          ? (isMarathi ? 'संपत आले' : 'Expiring Soon')
                          : (isMarathi ? 'संपले' : 'Expired')}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-1 bg-gray-50 rounded-xl p-4">
                  <dt className="text-sm font-semibold text-[#073327]/70 mb-1">
                    {isMarathi ? "सुरुवात तारीख" : "Start Date"}
                  </dt>
                  <dd className="text-base font-semibold text-[#2E2E2E]">
                    {customer.startDate.toDate().toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN')}
                  </dd>
                </div>
                <div className="sm:col-span-1 bg-gray-50 rounded-xl p-4">
                  <dt className="text-sm font-semibold text-[#073327]/70 mb-1">
                    {isMarathi ? "शेवटची तारीख" : "End Date"}
                  </dt>
                  <dd className="text-base font-semibold text-[#2E2E2E]">
                    {customer.endDate.toDate().toLocaleDateString(isMarathi ? 'en-IN' : 'en-IN')}
                  </dd>
                </div>
              </dl>
            </div>
          )}
          
          <div className="mt-8 text-center">
             <Link to="/login" className="text-sm font-semibold text-[#0F4C3A] hover:text-[#073327] flex items-center justify-center gap-1.5 group transition-colors">
               <span>
                 {isMarathi ? "मेस मालक आहात? येथे लॉगिन करा" : "Are you a mess owner? Login here"}
               </span>
               <span className="material-icons-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
