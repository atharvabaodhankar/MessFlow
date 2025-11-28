// UI Text translations
export const translations = {
  // Navigation
  dashboard: { mr: "डॅशबोर्ड", en: "Dashboard" },
  customers: { mr: "ग्राहक", en: "Customers" },
  attendance: { mr: "उपस्थिती", en: "Attendance" },
  plans: { mr: "प्लॅन्स", en: "Plans" },
  logout: { mr: "बाहेर पडा", en: "Logout" },
  
  // Dashboard
  dashboardOverview: { mr: "तुमच्या मेसचा आजचा आढावा", en: "Today's overview of your mess" },
  activeCustomers: { mr: "सक्रिय ग्राहक", en: "Active Customers" },
  todayAttendance: { mr: "आजची उपस्थिती", en: "Today's Attendance" },
  expiringSoon: { mr: "लवकरच संपणारे", en: "Expiring Soon" },
  quickActions: { mr: "जलद क्रिया (Quick Actions)", en: "Quick Actions" },
  addNewCustomer: { mr: "नवीन ग्राहक जोडा", en: "Add New Customer" },
  markAttendance: { mr: "उपस्थिती मार्क करा", en: "Mark Attendance" },
  
  // Customers Page
  customerList: { mr: "ग्राहक यादी", en: "Customer List" },
  allCustomersDetails: { mr: "तुमच्या सर्व ग्राहकांची यादी आणि त्यांचे सबस्क्रिप्शन तपशील.", en: "List of all your customers and their subscription details." },
  customerNumber: { mr: "ग्राहक क्रमांक (Number)", en: "Customer Number" },
  name: { mr: "नाव", en: "Name" },
  nameEnglish: { mr: "नाव (इंग्रजी / English Name)", en: "Name (English)" },
  nameMarathi: { mr: "नाव (मराठी / Marathi Name)", en: "Name (Marathi)" },
  mobile: { mr: "मोबाईल", en: "Mobile" },
  plan: { mr: "प्लॅन", en: "Plan" },
  startDate: { mr: "सुरुवात तारीख", en: "Start Date" },
  endDate: { mr: "शेवटची तारीख", en: "End Date" },
  payment: { mr: "पेमेंट", en: "Payment" },
  status: { mr: "स्थिती", en: "Status" },
  active: { mr: "सक्रिय", en: "Active" },
  expiring: { mr: "संपत आले", en: "Expiring" },
  expired: { mr: "संपले", en: "Expired" },
  addCustomer: { mr: "नवीन ग्राहक जोडा", en: "Add New Customer" },
  editCustomer: { mr: "ग्राहक संपादित करा", en: "Edit Customer" },
  save: { mr: "जतन करा", en: "Save" },
  saving: { mr: "जतन करत आहे...", en: "Saving..." },
  cancel: { mr: "रद्द करा", en: "Cancel" },
  deleteConfirm: { mr: "तुम्हाला खात्री आहे की तुम्ही या ग्राहकाला काढू इच्छिता?", en: "Are you sure you want to delete this customer?" },
  mobileNumber: { mr: "मोबाईल नंबर", en: "Mobile Number" },
  messPlan: { mr: "मेस प्लॅन", en: "Mess Plan" },
  selectPlan: { mr: "-- प्लॅन निवडा --", en: "-- Select Plan --" },
  amountPaid: { mr: "आतापर्यंत भरलेली रक्कम (₹)", en: "Amount Paid (₹)" },
  total: { mr: "एकूण", en: "Total" },
  remaining: { mr: "बाकी", en: "Remaining" },
  fullyPaid: { mr: "पूर्ण भरलेले", en: "Fully Paid" },
  optionalMarathi: { mr: "वैकल्पिक - रिक्त असल्यास इंग्रजी नाव वापरले जाईल", en: "Optional - English name will be used if left blank" },
  
  // Attendance Page
  attendanceTitle: { mr: "उपस्थिती (Attendance)", en: "Attendance" },
  manualAttendance: { mr: "मॅन्युअल उपस्थिती", en: "Manual Attendance" },
  qrCode: { mr: "QR कोड", en: "QR Code" },
  searchPlaceholder: { mr: "ग्राहक, नाव किंवा मोबाईल नंबर शोधा...", en: "Search customer, name or mobile number..." },
  searchHelp: { mr: "तुमी ग्राहक क्रमांक (उदा. 1, 2) टाइप करून थेट शोध शकता.", en: "You can search directly by customer number (e.g. 1, 2)." },
  markPresent: { mr: "हजर", en: "Present" },
  
  // Common
  loading: { mr: "लोड होत आहे...", en: "Loading..." },
  search: { mr: "शोधा", en: "Search" },
  searching: { mr: "शोधत आहे...", en: "Searching..." }
};

// Helper function to get translated text
export function t(key, language = 'mr') {
  const lang = language === 'mr' ? 'mr' : 'en';
  return translations[key]?.[lang] || key;
}
