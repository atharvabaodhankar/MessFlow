import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { db } from "../firebase";
import { collection, query, where, getCountFromServer, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { isMarathi } = useLanguage();
  const [stats, setStats] = useState({
    activeCustomers: 0,
    todayAttendance: 0,
    expiringSoon: 0
  });
  const [loading, setLoading] = useState(true);
  const [messName, setMessName] = useState("");

  useEffect(() => {
    if (currentUser) {
      fetchMessName();
      fetchStats();
    }
  }, [currentUser]);

  async function fetchMessName() {
    try {
      const messOwnerRef = doc(db, "messOwners", currentUser.uid);
      const messOwnerSnap = await getDoc(messOwnerRef);
      if (messOwnerSnap.exists()) {
        setMessName(messOwnerSnap.data().messName || "");
      }
    } catch (error) {
      console.error("Error fetching mess name:", error);
    }
  }

  async function fetchStats() {
    try {
      const activeQuery = query(
        collection(db, "customers"), 
        where("messId", "==", currentUser.uid),
        where("status", "==", "active")
      );
      const activeSnapshot = await getCountFromServer(activeQuery);

      const today = new Date().toISOString().split('T')[0];
      const attendanceQuery = query(
        collection(db, "attendance"),
        where("messId", "==", currentUser.uid),
        where("date", "==", today)
      );
      const attendanceSnapshot = await getCountFromServer(attendanceQuery);

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

  return (
    <Layout>
      <div className="max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#073327]">
            {messName || (isMarathi ? "मेसफ्लो" : "MessFlow")}
          </h1>
          <p className="mt-2 text-[#2E2E2E]">
            {isMarathi ? "तुमच्या मेसचा आजचा आढावा" : "Here's a summary of your mess today"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Active Customers */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-[#38A169]/10 flex items-center justify-center flex-shrink-0">
              <span className="material-icons-outlined text-[#38A169] text-2xl">groups</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {isMarathi ? "सक्रिय ग्राहक" : "Active Customers"}
              </p>
              <p className="text-3xl font-bold text-[#073327]">
                {loading ? "..." : stats.activeCustomers}
              </p>
            </div>
          </div>

          {/* Daily Attendance */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-[#E8F3EF] flex items-center justify-center flex-shrink-0">
              <span className="material-icons-outlined text-[#0F4C3A] text-2xl">restaurant</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {isMarathi ? "आजची उपस्थिती" : "Daily Attendance"}
              </p>
              <p className="text-3xl font-bold text-[#073327]">
                {loading ? "..." : stats.todayAttendance}
              </p>
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-[#ECC94B]/10 flex items-center justify-center flex-shrink-0">
              <span className="material-icons-outlined text-[#ECC94B] text-2xl">hourglass_top</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {isMarathi ? "लवकरच संपणारे" : "Expiring Soon"}
              </p>
              <p className="text-3xl font-bold text-[#073327]">
                {loading ? "..." : stats.expiringSoon}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-semibold text-[#073327] mb-6">
            {isMarathi ? "जलद क्रिया" : "Quick Actions"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Add New Customer */}
            <button
              onClick={() => window.location.href = '/customers'}
              className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-[#0F4C3A] hover:shadow-lg transition-all flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-[#E8F3EF] group-hover:bg-[#0F4C3A]/20 flex items-center justify-center mb-4 transition-colors">
                <span className="material-icons-outlined text-[#0F4C3A] group-hover:text-[#0F4C3A] text-3xl transition-colors">person_add</span>
              </div>
              <h3 className="font-semibold text-[#073327] text-lg mb-2">
                {isMarathi ? "नवीन ग्राहक जोडा" : "Add New Customer"}
              </h3>
              <p className="text-sm text-[#2E2E2E]">
                {isMarathi ? "तुमच्या मेसमध्ये नवीन सदस्य जोडा" : "Onboard a new member to your mess"}
              </p>
            </button>

            {/* Mark Attendance */}
            <button
              onClick={() => window.location.href = '/attendance'}
              className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-[#0F4C3A] hover:shadow-lg transition-all flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-[#E8F3EF] group-hover:bg-[#0F4C3A]/20 flex items-center justify-center mb-4 transition-colors">
                <span className="material-icons-outlined text-[#0F4C3A] group-hover:text-[#0F4C3A] text-3xl transition-colors">edit_calendar</span>
              </div>
              <h3 className="font-semibold text-[#073327] text-lg mb-2">
                {isMarathi ? "उपस्थिती मार्क करा" : "Mark Attendance"}
              </h3>
              <p className="text-sm text-[#2E2E2E]">
                {isMarathi ? "आजच्या सदस्यांची उपस्थिती नोंद करा" : "Record today's attendance for members"}
              </p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
