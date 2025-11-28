import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { QRCodeSVG } from "qrcode.react";
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
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

export default function Attendance() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("manual"); // manual, qr
  const [customers, setCustomers] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState({});
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, today]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch Active Customers
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
      setCustomers(customerList);

      // Fetch Today's Attendance
      // Note: In a real app, you'd query by date range or specific date field
      // For simplicity, we'll fetch all and filter client-side or use a composite index
      // Better: Store date as string "YYYY-MM-DD" in attendance record
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
      if (attendanceToday[customerId]) return; // Already marked

      await addDoc(collection(db, "attendance"), {
        messId: currentUser.uid,
        customerId: customerId,
        date: today,
        timestamp: Timestamp.now(),
        method: "manual"
      });

      setAttendanceToday(prev => ({ ...prev, [customerId]: true }));
    } catch (error) {
      console.error("Error marking attendance:", error);
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">उपस्थिती (Attendance)</h1>
        <p className="mt-1 text-sm text-gray-500">
          आजची तारीख: {new Date().toLocaleDateString('mr-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("manual")}
            className={`${
              activeTab === "manual"
                ? "border-rose-500 text-rose-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            मॅन्युअल उपस्थिती
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            className={`${
              activeTab === "qr"
                ? "border-rose-500 text-rose-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            QR कोड
          </button>
        </nav>
      </div>

      {activeTab === "manual" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {customers.map((customer) => {
              const isPresent = attendanceToday[customer.id];
              return (
                <li key={customer.id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div className="truncate">
                        <div className="flex text-sm">
                          <p className="font-medium text-indigo-600 truncate">{customer.name}</p>
                          <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                            ({customer.mobile})
                          </p>
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
                          className="inline-flex items-center rounded-md border border-transparent bg-rose-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                        >
                          हजर करा
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            {customers.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">
                कोणतेही सक्रिय ग्राहक आढळले नाहीत.
              </li>
            )}
          </ul>
        </div>
      )}

      {activeTab === "qr" && (
        <div className="flex flex-col items-center justify-center py-12 bg-white shadow rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">आजचा QR कोड स्कॅन करा</h3>
          <div className="p-4 bg-white border-2 border-gray-900 rounded-lg">
            <QRCodeSVG 
              value={JSON.stringify({
                messId: currentUser?.uid,
                date: today,
                type: "attendance"
              })}
              size={256}
            />
          </div>
          <p className="mt-4 text-sm text-gray-500">
            ग्राहकांना हा कोड स्कॅन करण्यास सांगा.
          </p>
        </div>
      )}
    </Layout>
  );
}
