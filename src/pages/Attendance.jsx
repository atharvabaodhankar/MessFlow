import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { db } from "../firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  Timestamp 
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { CheckCircleIcon, MagnifyingGlassIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { translateMRtoEN } from "../utils/translator";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";

export default function Attendance() {
  const { currentUser } = useAuth();
  const { isMarathi } = useLanguage();
  // const [activeTab, setActiveTab] = useState("manual"); // Removed QR tab
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, today]);

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim() === "") {
        setFilteredCustomers(customers);
        return;
      }

      setIsSearching(true);
      try {
        const lowerQuery = searchQuery.toLowerCase();
        
        // 1. Prioritize Exact Customer Number Match
        const exactNumberMatch = customers.find(c => 
          c.customerNumber && c.customerNumber.toString() === lowerQuery
        );

        let matches = [];
        if (exactNumberMatch) {
          matches = [exactNumberMatch];
        } else {
          // 2. If no exact number match, search Name and Mobile
          matches = customers.filter(c => 
            c.name.toLowerCase().includes(lowerQuery) || 
            c.mobile.includes(lowerQuery)
          );
        }

        // 2. If no direct matches, try translating Marathi query to English
        const hasNonAscii = /[^\x00-\x7F]/.test(searchQuery);
        
        if (hasNonAscii) {
          const translatedName = await translateMRtoEN(searchQuery);
          console.log(`Translated "${searchQuery}" to "${translatedName}"`);
          
          if (translatedName) {
            const translatedLower = translatedName.toLowerCase().trim();
            const translatedMatches = customers.filter(c => 
              c.name.toLowerCase().includes(translatedLower)
            );
            // Merge unique matches
            const existingIds = new Set(matches.map(c => c.id));
            translatedMatches.forEach(c => {
              if (!existingIds.has(c.id)) {
                matches.push(c);
              }
            });
          }
        }

        setFilteredCustomers(matches);
      } catch (err) {
        console.error("Search error", err);
        setFilteredCustomers(
          customers.filter(c => 
            (c.customerNumber && c.customerNumber.toString() === searchQuery) ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            c.mobile.includes(searchQuery)
          )
        );
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, customers]);

  async function fetchData() {
    setLoading(true);
    try {
      const customersQuery = query(
        collection(db, "customers"), 
        where("messId", "==", currentUser.uid),
        where("status", "==", "active")
      );
      const customerSnapshot = await getDocs(customersQuery);
      const customerList = customerSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by number
      customerList.sort((a, b) => (a.customerNumber || 0) - (b.customerNumber || 0));
      
      setCustomers(customerList);
      setFilteredCustomers(customerList);

      const attendanceQuery = query(
        collection(db, "attendance"),
        where("messId", "==", currentUser.uid),
        where("date", "==", today)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendanceMap = {};
      attendanceSnapshot.docs.forEach(doc => {
        attendanceMap[doc.data().customerId] = true;
      });
      setAttendanceToday(attendanceMap);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markAttendance(customerId) {
    try {
      if (attendanceToday[customerId]) return;

      const customerRef = doc(db, "customers", customerId);
      const customerSnap = await getDoc(customerRef);
      
      if (customerSnap.exists()) {
        const customerData = customerSnap.data();
        
        // Check Validity
        const todayDate = new Date(today);
        const endDate = customerData.endDate.toDate();
        if (todayDate > endDate) {
          alert(isMarathi ? "या ग्राहकाची वैधता संपली आहे!" : "This customer's plan has expired!");
          return;
        }

        // Check Meals Limit
        if (customerData.totalMeals > 0 && (customerData.mealsConsumed || 0) >= customerData.totalMeals) {
          alert(isMarathi ? "या ग्राहकाचे सर्व जेवण संपले आहेत!" : "This customer has consumed all their meals!");
          return;
        }

        // Mark Attendance
        await addDoc(collection(db, "attendance"), {
          messId: currentUser.uid,
          customerId: customerId,
          date: today,
          timestamp: Timestamp.now(),
          method: "manual"
        });

        // Increment Meals Consumed
        await updateDoc(customerRef, {
          mealsConsumed: increment(1)
        });

        // Update local state
        setAttendanceToday(prev => ({ ...prev, [customerId]: true }));
        
        // Update customer list locally to reflect new meal count
        setCustomers(prev => prev.map(c => {
          if (c.id === customerId) {
            return { ...c, mealsConsumed: (c.mealsConsumed || 0) + 1 };
          }
          return c;
        }));
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert("Error marking attendance. Please try again.");
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">उपस्थिती (Attendance)</h1>
        <p className="mt-1 text-sm text-gray-500">
          आजची तारीख: {new Date().toLocaleDateString('mr-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>




      <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative rounded-md shadow-sm max-w-lg">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full rounded-xl border-gray-300 pl-10 focus:border-[#0F4C3A] focus:ring-[#0F4C3A] sm:text-sm py-2"
                placeholder="क्रमांक, नाव किंवा मोबाईल नंबर शोधा..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="animate-spin h-5 w-5 text-[#0F4C3A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              तुम्ही ग्राहक क्रमांक (उदा. 1, 2) टाकून थेट शोधू शकता.
            </p>
          </div>

          <ul role="list" className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => {
              const isPresent = attendanceToday[customer.id];
              return (
                <li key={customer.id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div className="truncate">
                        <div className="flex text-sm">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-xs font-bold text-gray-600 mr-2">
                            {customer.customerNumber || "-"}
                          </span>
                          <div className="flex flex-col">
                            <p className="font-medium text-[#0F4C3A] truncate">
                              {isMarathi ? (customer.nameMarathi || customer.name) : customer.name}
                            </p>
                            {isMarathi && customer.nameMarathi && customer.nameMarathi !== customer.name && (
                              <p className="text-xs text-gray-400">{customer.name}</p>
                            )}
                            {!isMarathi && customer.nameMarathi && (
                              <p className="text-xs text-gray-400">{customer.nameMarathi}</p>
                            )}
                          </div>
                          <p className="ml-1 flex-shrink-0 font-normal text-gray-500 self-center">
                            ({customer.mobile})
                          </p>
                          {customer.totalMeals > 0 && (
                            <div className="ml-2 flex items-center">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                (customer.totalMeals - (customer.mealsConsumed || 0)) < 5 
                                  ? "bg-red-100 text-red-800" 
                                  : "bg-green-100 text-green-800"
                              }`}>
                                {customer.totalMeals - (customer.mealsConsumed || 0)} जेवण बाकी
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      {isPresent ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-6 w-6 mr-1" />
                          <span className="text-sm font-medium">हजर</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => markAttendance(customer.id)}
                          className="inline-flex items-center rounded-xl border border-transparent bg-[#0F4C3A] px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-[#073327] focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:ring-offset-2 transition-colors"
                        >
                          हजर करा
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            {filteredCustomers.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">
                {searchQuery ? "कोणतेही ग्राहक सापडले नाहीत." : "कोणतेही सक्रिय ग्राहक आढळले नाहीत."}
              </li>
            )}
          </ul>
        </div>
        </div>
    </Layout>
  );
}
