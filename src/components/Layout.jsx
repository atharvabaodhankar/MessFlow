import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Layout({ children }) {
  const { currentUser, logout } = useAuth();
  const { language, toggleLanguage, isMarathi } = useLanguage();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messName, setMessName] = useState("");

  React.useEffect(() => {
    async function fetchMessName() {
      if (currentUser) {
        try {
          const docRef = doc(db, "messOwners", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setMessName(docSnap.data().messName);
          }
        } catch (error) {
          console.error("Error fetching mess name:", error);
        }
      }
    }
    fetchMessName();
  }, [currentUser]);

  const navigation = [
    { nameMr: "डॅशबोर्ड", nameEn: "Dashboard", href: "/dashboard", icon: "home" },
    { nameMr: "ग्राहक", nameEn: "Customers", href: "/customers", icon: "groups" },
    { nameMr: "उपस्थिती", nameEn: "Attendance", href: "/attendance", icon: "checklist" },
    { nameMr: "प्लॅन्स", nameEn: "Plans", href: "/plans", icon: "receipt_long" },
  ];

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  return (
    <div className="min-h-screen bg-brand-mint flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-gray-200">
        {/* Logo */}
        {/* Logo */}
        
        <div className="h-20 flex items-center justify-center border-b border-[#E8F3EF] px-4">
          <h1 className="text-xl font-bold text-[#0F4C3A] text-center truncate">
            {messName}
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#E8F3EF] text-[#0F4C3A]"
                    : "text-[#2E2E2E] hover:bg-gray-50 hover:text-[#0F4C3A]"
                }`}
              >
                <span className={`material-icons-outlined mr-3 text-xl ${isActive ? 'text-[#0F4C3A]' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                {isMarathi ? item.nameMr : item.nameEn}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#E8F3EF]">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-[#2E2E2E] hover:bg-gray-50 hover:text-[#0F4C3A] rounded-lg transition-colors"
          >
            <span className="material-icons-outlined mr-3 text-xl text-gray-400">logout</span>
            {isMarathi ? "बाहेर पडा" : "Logout"}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white transform transition-transform duration-300 ease-in-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-center border-b border-[#E8F3EF] px-4">
          <h1 className="text-xl font-bold text-[#0F4C3A] text-center truncate">
            {messName || (isMarathi ? "मेसफ्लो" : "MessFlow")}
          </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#E8F3EF] text-[#0F4C3A]"
                    : "text-[#2E2E2E] hover:bg-gray-50 hover:text-[#0F4C3A]"
                }`}
              >
                <span className={`material-icons-outlined mr-3 text-xl ${isActive ? 'text-[#0F4C3A]' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                {isMarathi ? item.nameMr : item.nameEn}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-[#E8F3EF] flex items-center justify-between px-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg text-[#2E2E2E] hover:bg-[#E8F3EF]"
          >
            <span className="material-icons-outlined">menu</span>
          </button>

          {/* Language Toggle & User Avatar */}
          <div className="ml-auto flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center text-sm text-[#2E2E2E] hover:text-[#0F4C3A] px-3 py-2 rounded-lg hover:bg-[#E8F3EF] transition-colors"
            >
              <span className="material-icons-outlined mr-2 text-lg text-[#D4A941]">translate</span>
              {isMarathi ? "English (EN)" : "मराठी (MR)"}
            </button>
            <div className="w-10 h-10 rounded-full bg-[#D4A941]/20 flex items-center justify-center">
              <span className="material-icons-outlined text-[#D4A941]">person</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#E8F3EF] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
