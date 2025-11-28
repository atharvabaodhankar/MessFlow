import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { db } from "../firebase";
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { UsersIcon, QrCodeIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    activeCustomers: 0,
    todayAttendance: 0,
    expiringSoon: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchStats();
    }
  }, [currentUser]);

  async function fetchStats() {
    try {
      // 1. Active Customers
      const activeQuery = query(
        collection(db, "customers"), 
        where("messId", "==", currentUser.uid),
        where("status", "==", "active")
      );
      const activeSnapshot = await getCountFromServer(activeQuery);

      // 2. Today's Attendance
      const today = new Date().toISOString().split('T')[0];
      const attendanceQuery = query(
        collection(db, "attendance"),
        where("messId", "==", currentUser.uid),
        where("date", "==", today)
      );
      const attendanceSnapshot = await getCountFromServer(attendanceQuery);

      // 3. Expiring Soon (This is harder with just count, need to query by date)
      // For now, we'll just query 'expiring' status if we have a cloud function updating it.
      // Or we can query by endDate range. Let's assume 'expiring' status is reliable for now 
      // (or we can implement the logic later).
      const expiringQuery = query(
        collection(db, "customers"),
        where("messId", "==", currentUser.uid),
        where("status", "==", "expiring")
      );
      const expiringSnapshot = await getCountFromServer(expiringQuery);

      setStats({
        activeCustomers: activeSnapshot.data().count,
        todayAttendance: attendanceSnapshot.data().count,
        expiringSoon: expiringSnapshot.data().count
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    {
      name: "सक्रिय ग्राहक",
      value: stats.activeCustomers,
      icon: UsersIcon,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      textColor: "text-blue-50",
    },
    {
      name: "आजची उपस्थिती",
      value: stats.todayAttendance,
      icon: QrCodeIcon,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      textColor: "text-green-50",
    },
    {
      name: "लवकरच संपणारे",
      value: stats.expiringSoon,
      icon: ClockIcon,
      color: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      textColor: "text-yellow-50",
    },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">डॅशबोर्ड</h1>
        <p className="mt-2 text-sm text-gray-600">
          तुमच्या मेसचा आजचा आढावा
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.name}
            className={`${card.color} rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 duration-300`}
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                  <card.icon className={`h-8 w-8 ${card.textColor}`} aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${card.textColor} opacity-80 truncate`}>
                      {card.name}
                    </dt>
                    <dd>
                      <div className={`text-3xl font-bold ${card.textColor}`}>
                        {loading ? "..." : card.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions or Recent Activity could go here */}
      <div className="mt-10">
        <h2 className="text-lg font-medium text-gray-900 mb-4">जलद क्रिया (Quick Actions)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
           <button 
             onClick={() => window.location.href = '/customers'}
             className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center space-x-3"
           >
             <div className="bg-rose-100 p-2 rounded-full">
               <UsersIcon className="h-6 w-6 text-rose-600" />
             </div>
             <span className="font-medium text-gray-700">नवीन ग्राहक जोडा</span>
           </button>
           <button 
             onClick={() => window.location.href = '/attendance'}
             className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center space-x-3"
           >
             <div className="bg-indigo-100 p-2 rounded-full">
               <QrCodeIcon className="h-6 w-6 text-indigo-600" />
             </div>
             <span className="font-medium text-gray-700">उपस्थिती मार्क करा</span>
           </button>
        </div>
      </div>
    </Layout>
  );
}
