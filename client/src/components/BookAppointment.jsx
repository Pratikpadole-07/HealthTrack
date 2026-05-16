import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createAppointment } from "../assets/api/api";
import { CalendarDaysIcon, ClockIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

const BookAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const doctorId = searchParams.get("doctorId");
  const doctorName = searchParams.get("doctorName") || "Selected Doctor";

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      setStatusMsg("Please select date and time");
      return;
    }

    setLoading(true);
    setStatusMsg("");

    try {
      const dateTimeString = `${date}T${time}:00`;
      await createAppointment({
        doctorId,
        appointmentDate: dateTimeString,
        reason,
      });

      setStatusMsg("success");
      setTimeout(() => navigate("/appointments"), 800);
    } catch (err) {
      console.error("Error booking:", err);
      setStatusMsg("error");
    }

    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto"
    >
      <div className="glass-card-strong p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg mb-4">
            <CalendarDaysIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Book appointment</h2>
          <p className="text-slate-500 mt-1 text-sm">
            With <span className="font-semibold text-cyan-800">{decodeURIComponent(doctorName)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <CalendarDaysIcon className="h-4 w-4" /> Date
            </label>
            <input
              type="date"
              className="input-modern"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <ClockIcon className="h-4 w-4" /> Time
            </label>
            <input
              type="time"
              className="input-modern"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <DocumentTextIcon className="h-4 w-4" /> Reason (optional)
            </label>
            <textarea
              className="input-modern resize-none"
              rows="3"
              placeholder="Briefly describe your symptoms or visit purpose"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {statusMsg === "success" && (
            <p className="text-sm text-center text-emerald-600 font-medium">Appointment booked successfully!</p>
          )}
          {statusMsg === "error" && (
            <p className="text-sm text-center text-red-600 font-medium">Booking failed. Please try again.</p>
          )}
          {statusMsg && statusMsg !== "success" && statusMsg !== "error" && (
            <p className="text-sm text-center text-amber-600">{statusMsg}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? "Booking…" : "Confirm appointment"}
          </button>

          <button type="button" onClick={() => navigate(-1)} className="btn-ghost w-full">
            Go back
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default BookAppointment;
