import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { db } from "../firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function Analytics() {
  const { currentUser } = useAuth();
  const { isMarathi } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    activeCustomers: 0,
    expiringSoon: 0,
    todayAttendance: 0,
    averageAttendance: 0,
    lowBalanceCustomers: 0,
    totalOutstanding: 0,
    revenueByPlan: [],
    customerGrowth: [],
    attendanceTrend: [],
    statusDistribution: [],
    planDistribution: []
  });

  useEffect(() => {
    if (currentUser) {
      fetchAnalytics();
    }
  }, [currentUser]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      // Fetch all customers
      const customersQuery = query(
        collection(db, "customers"),
        where("messId", "==", currentUser.uid)
      );
      const customersSnapshot = await getDocs(customersQuery);
      const customers = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch all plans
      const plansQuery = query(
        collection(db, "plans"),
        where("messId", "==", currentUser.uid)
      );
      const plansSnapshot = await getDocs(plansQuery);
      const plans = plansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch attendance for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const attendanceQuery = query(
        collection(db, "attendance"),
        where("messId", "==", currentUser.uid)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendance = attendanceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate metrics
      const today = new Date().toISOString().split('T')[0];
      const activeCustomers = customers.filter(c => c.status === 'active');
      
      // Total Revenue
      const totalRevenue = customers.reduce((sum, c) => sum + (c.amountPaid || 0), 0);
      
      // Total Outstanding
      const totalOutstanding = customers.reduce((sum, c) => sum + (c.remainingAmount || 0), 0);
      
      // Expiring Soon (7 days)
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      const expiringSoon = activeCustomers.filter(c => {
        const endDate = c.endDate.toDate();
        return endDate <= sevenDaysFromNow && endDate >= new Date();
      }).length;
      
      // Low Balance Customers
      const lowBalanceCustomers = activeCustomers.filter(c => {
        const daysLeft = Math.ceil((c.endDate.toDate() - new Date()) / (1000 * 60 * 60 * 24));
        const mealsLeft = c.totalMeals > 0 ? c.totalMeals - (c.mealsConsumed || 0) : null;
        return daysLeft <= 5 || (mealsLeft !== null && mealsLeft <= 5);
      }).length;
      
      // Today's Attendance
      const todayAttendance = attendance.filter(a => a.date === today).length;
      
      // Average Attendance (last 30 days)
      const last30DaysAttendance = attendance.filter(a => {
        const attendanceDate = new Date(a.date);
        return attendanceDate >= thirtyDaysAgo;
      });
      const averageAttendance = activeCustomers.length > 0 
        ? Math.round((last30DaysAttendance.length / 30 / activeCustomers.length) * 100)
        : 0;

      // Revenue by Plan
      const revenueByPlan = plans.map(plan => {
        const planCustomers = customers.filter(c => c.planId === plan.id);
        const revenue = planCustomers.reduce((sum, c) => sum + (c.amountPaid || 0), 0);
        return {
          name: plan.name,
          revenue: revenue
        };
      }).filter(p => p.revenue > 0);

      // Status Distribution
      const statusDistribution = [
        { 
          name: isMarathi ? 'सक्रिय' : 'Active', 
          value: customers.filter(c => c.status === 'active').length,
          color: '#38A169'
        },
        { 
          name: isMarathi ? 'संपत आले' : 'Expiring', 
          value: customers.filter(c => c.status === 'expiring').length,
          color: '#ECC94B'
        },
        { 
          name: isMarathi ? 'संपले' : 'Expired', 
          value: customers.filter(c => c.status === 'expired').length,
          color: '#E53E3E'
        }
      ].filter(s => s.value > 0);

      // Plan Distribution
      const planDistribution = plans.map(plan => ({
        name: plan.name,
        value: customers.filter(c => c.planId === plan.id && c.status === 'active').length
      })).filter(p => p.value > 0);

      // Attendance Trend (last 30 days)
      const attendanceTrend = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = attendance.filter(a => a.date === dateStr).length;
        attendanceTrend.push({
          date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          count: count
        });
      }

      // Customer Growth (last 6 months)
      const customerGrowth = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const count = customers.filter(c => {
          const createdDate = c.createdAt.toDate();
          return createdDate >= monthStart && createdDate <= monthEnd;
        }).length;
        
        customerGrowth.push({
          month: date.toLocaleDateString('en-IN', { month: 'short' }),
          count: count
        });
      }

      setAnalytics({
        totalRevenue,
        activeCustomers: activeCustomers.length,
        expiringSoon,
        todayAttendance,
        averageAttendance,
        lowBalanceCustomers,
        totalOutstanding,
        revenueByPlan,
        customerGrowth,
        attendanceTrend,
        statusDistribution,
        planDistribution
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-14 h-14 rounded-xl ${color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
          <Icon className={`h-7 w-7 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F4C3A]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#073327]">
            {isMarathi ? "विश्लेषण आणि अहवाल" : "Analytics & Reports"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isMarathi 
              ? "तुमच्या मेस व्यवसायाचे संपूर्ण विश्लेषण" 
              : "Comprehensive analysis of your mess business"}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title={isMarathi ? "एकूण महसूल" : "Total Revenue"}
            value={`₹${analytics.totalRevenue.toLocaleString('en-IN')}`}
            icon={CurrencyRupeeIcon}
            color="text-green-600"
          />
          <StatCard
            title={isMarathi ? "सक्रिय ग्राहक" : "Active Customers"}
            value={analytics.activeCustomers}
            icon={UsersIcon}
            color="text-[#0F4C3A]"
          />
          <StatCard
            title={isMarathi ? "आजची उपस्थिती" : "Today's Attendance"}
            value={analytics.todayAttendance}
            icon={CalendarIcon}
            color="text-blue-600"
            subtitle={`${analytics.averageAttendance}% ${isMarathi ? 'सरासरी' : 'avg'}`}
          />
          <StatCard
            title={isMarathi ? "लवकरच संपणारे" : "Expiring Soon"}
            value={analytics.expiringSoon}
            icon={ExclamationTriangleIcon}
            color="text-yellow-600"
          />
          <StatCard
            title={isMarathi ? "कमी शिल्लक" : "Low Balance"}
            value={analytics.lowBalanceCustomers}
            icon={ArrowTrendingUpIcon}
            color="text-red-600"
          />
          <StatCard
            title={isMarathi ? "थकबाकी" : "Outstanding"}
            value={`₹${analytics.totalOutstanding.toLocaleString('en-IN')}`}
            icon={ChartBarIcon}
            color="text-orange-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Trend */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-[#073327] mb-4">
              {isMarathi ? "उपस्थिती ट्रेंड (30 दिवस)" : "Attendance Trend (30 Days)"}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#0F4C3A" 
                  strokeWidth={2}
                  dot={{ fill: '#0F4C3A', r: 4 }}
                  name={isMarathi ? "उपस्थिती" : "Attendance"}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Customer Growth */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-[#073327] mb-4">
              {isMarathi ? "ग्राहक वाढ (6 महिने)" : "Customer Growth (6 Months)"}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  fill="#0F4C3A" 
                  radius={[8, 8, 0, 0]}
                  name={isMarathi ? "नवीन ग्राहक" : "New Customers"}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          {analytics.statusDistribution.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-[#073327] mb-4">
                {isMarathi ? "स्थिती वितरण" : "Status Distribution"}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Revenue by Plan */}
          {analytics.revenueByPlan.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-[#073327] mb-4">
                {isMarathi ? "प्लॅननुसार महसूल" : "Revenue by Plan"}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.revenueByPlan} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip />
                  <Bar 
                    dataKey="revenue" 
                    fill="#D4A941" 
                    radius={[0, 8, 8, 0]}
                    name={isMarathi ? "महसूल (₹)" : "Revenue (₹)"}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-[#E8F3EF] to-[#F5E6C3] rounded-2xl p-6 border border-[#0F4C3A]/10">
            <h4 className="text-sm font-semibold text-[#073327]/70 mb-2">
              {isMarathi ? "अपेक्षित मासिक महसूल" : "Expected Monthly Revenue"}
            </h4>
            <p className="text-2xl font-bold text-[#0F4C3A]">
              ₹{(analytics.totalRevenue + analytics.totalOutstanding).toLocaleString('en-IN')}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-[#E8F3EF] to-[#F5E6C3] rounded-2xl p-6 border border-[#0F4C3A]/10">
            <h4 className="text-sm font-semibold text-[#073327]/70 mb-2">
              {isMarathi ? "प्रति ग्राहक सरासरी महसूल" : "Avg Revenue Per Customer"}
            </h4>
            <p className="text-2xl font-bold text-[#0F4C3A]">
              ₹{analytics.activeCustomers > 0 
                ? Math.round(analytics.totalRevenue / analytics.activeCustomers).toLocaleString('en-IN')
                : 0}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-[#E8F3EF] to-[#F5E6C3] rounded-2xl p-6 border border-[#0F4C3A]/10">
            <h4 className="text-sm font-semibold text-[#073327]/70 mb-2">
              {isMarathi ? "संकलन दर" : "Collection Rate"}
            </h4>
            <p className="text-2xl font-bold text-[#0F4C3A]">
              {analytics.totalRevenue + analytics.totalOutstanding > 0
                ? Math.round((analytics.totalRevenue / (analytics.totalRevenue + analytics.totalOutstanding)) * 100)
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
