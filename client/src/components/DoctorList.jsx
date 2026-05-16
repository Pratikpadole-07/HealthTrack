import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getDoctorsByCondition } from "../assets/api/api";
import {
  BuildingOffice2Icon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const DoctorList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const condition = new URLSearchParams(location.search).get("condition") || "";

  const [doctors, setDoctors] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = await getDoctorsByCondition(condition.toLowerCase().trim() || "general");

        if (Array.isArray(res.data)) {
          setDoctors(res.data);
          setMessage("");
        } else {
          setDoctors([]);
          setMessage(res.data?.message || "No doctors found for this condition");
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setMessage("Could not load doctors. Try again later.");
      }
      setLoading(false);
    };

    fetchDoctors();
  }, [condition]);

  const handleBookClick = (doctor) => {
    navigate(
      `/book-appointment?doctorId=${doctor._id}&doctorName=${encodeURIComponent(doctor.name)}`
    );
  };

  return (
    <div className="page-mesh max-w-3xl mx-auto space-y-8 relative z-10 pb-12">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-strong p-8 text-center"
      >
        <p className="text-sm font-semibold text-cyan-700 uppercase tracking-wider">Specialists near you</p>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
          Doctors for <span className="gradient-text">{condition || "your care"}</span>
        </h1>
        <p className="text-slate-500 mt-2 text-sm">Book an appointment for follow-up care</p>
      </motion.header>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-3 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
        </div>
      )}

      {message && !loading && (
        <div className="glass-card p-8 text-center">
          <p className="text-slate-600 font-medium">{message}</p>
        </div>
      )}

      <div className="space-y-4">
        {doctors.map((doc, i) => (
          <motion.article
            key={doc._id || i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg">
                <UserCircleIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-slate-900">Dr. {doc.name}</h3>
                <p className="text-sm font-medium text-cyan-700 mt-0.5">
                  {doc.specialty || doc.specialization || "General Physician"}
                </p>
                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  {doc.hospital && (
                    <span className="flex items-center gap-2">
                      <BuildingOffice2Icon className="h-4 w-4 text-slate-400 shrink-0" />
                      {doc.hospital}
                    </span>
                  )}
                  {doc.email && (
                    <span className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 text-slate-400 shrink-0" />
                      {doc.email}
                    </span>
                  )}
                  {doc.phone && (
                    <a href={`tel:${doc.phone}`} className="flex items-center gap-2 text-cyan-700 hover:underline">
                      <PhoneIcon className="h-4 w-4 shrink-0" />
                      {doc.phone}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0">
                <button onClick={() => handleBookClick(doc)} className="btn-primary whitespace-nowrap">
                  <CalendarDaysIcon className="h-5 w-5" />
                  Book visit
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
};

export default DoctorList;
