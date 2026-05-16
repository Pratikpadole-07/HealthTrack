import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getMyAppointments } from "../assets/api/api";
import { CalendarDaysIcon, UserCircleIcon } from "@heroicons/react/24/outline";

const statusStyles = {
  confirmed: "badge-success",
  cancelled: "badge-emergency",
  completed: "bg-purple-100 text-purple-700 border-purple-200",
  pending: "badge-pending",
};

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await getMyAppointments();
      setAppointments(res.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="page-mesh max-w-3xl mx-auto space-y-8 relative z-10 pb-12">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-strong p-8"
      >
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <CalendarDaysIcon className="h-8 w-8 text-cyan-600" />
          My appointments
        </h1>
        <p className="text-slate-500 mt-2 text-sm">Track upcoming and past visits</p>
      </motion.header>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-2 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CalendarDaysIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No appointments yet</p>
          <p className="text-sm text-slate-400 mt-1">Use symptom checker to find a doctor and book a visit</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((a, i) => (
            <motion.div
              key={a._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6"
            >
              <div className="flex flex-wrap justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shrink-0">
                    <UserCircleIcon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      Dr. {a.doctor?.name}
                    </p>
                    <p className="text-sm text-cyan-700">
                      {a.doctor?.specialty || a.doctor?.specialization || "General"}
                    </p>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5">
                      <CalendarDaysIcon className="h-4 w-4" />
                      {new Date(a.appointmentDate).toLocaleString()}
                    </p>
                    {a.reason && (
                      <p className="text-xs text-slate-500 mt-2 max-w-md">
                        <span className="font-medium text-slate-600">Reason:</span> {a.reason}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`badge h-fit ${statusStyles[a.status] || statusStyles.pending}`}>
                  {a.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
