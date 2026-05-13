import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import SymptomChecker from "./pages/SymptomChecker";
import Profile from "./pages/Profile";
import "./App.css";
import SymptomHistory from "./pages/SymptomHistory";
import HealthCalendar from "./pages/HealthCalendar"
import DoctorList from "./components/DoctorList";
import BookAppointment from "./components/BookAppointment";
import PatientAppointments from "./components/PatientAppointments";
import Notifications from "./components/Notifications";
// Route transitions
const AnimatedRoutes = () => {
  const location = useLocation();

  const PageAnimation = (Component) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Component />
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={PageAnimation(Login)} />
        <Route path="/login" element={PageAnimation(Login)} />
        <Route path="/register" element={PageAnimation(Register)} />
        <Route path="/patient-dashboard" element={PageAnimation(PatientDashboard)} />
        <Route path="/doctor-dashboard" element={PageAnimation(DoctorDashboard)} />
        <Route path="/symptom-checker" element={PageAnimation(SymptomChecker)} />
        <Route path="/profile" element={PageAnimation(Profile)} />
        <Route path="/symptom-history" element={<SymptomHistory />} />
        <Route path="/health-calendar" element={<HealthCalendar />} />
        <Route path="/doctors" element={<DoctorList />} />
        
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/appointments" element={<PatientAppointments />} />
        <Route path="/notifications" element={<Notifications />} />

      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const location = useLocation();
  const noUIRoutes = ["/login", "/register"];
  const hideUI = noUIRoutes.includes(location.pathname);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">

        {/* Hide Navbar on Login/Register */}
        {!hideUI && <Navbar />}

        <main
          className={
            hideUI
              ? "p-0"
              : "container mx-auto px-4 py-8"
          }
        >
          <AnimatedRoutes />
        </main>

        {/* Hide Footer on Login/Register */}
        {!hideUI && (
          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <span className="text-sm text-gray-500">
                  © {new Date().getFullYear()} HealthTrack. All rights reserved.
                </span>
                <div className="flex space-x-6">
                  <span className="text-sm text-gray-400 hover:text-gray-500">Privacy Policy</span>
                  <span className="text-sm text-gray-400 hover:text-gray-500">Terms of Service</span>
                  <span className="text-sm text-gray-400 hover:text-gray-500">Contact Us</span>
                </div>
              </div>
            </div>
          </footer>
        )}

      </div>
    </AuthProvider>
  );
}

export default function RootApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
