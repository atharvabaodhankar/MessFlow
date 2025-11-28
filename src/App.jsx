import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";

// Placeholder for Dashboard
function Dashboard() {
  const { logout } = useAuth();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">डॅशबोर्ड (Dashboard)</h1>
      <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
        बाहेर पडा (Logout)
      </button>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
