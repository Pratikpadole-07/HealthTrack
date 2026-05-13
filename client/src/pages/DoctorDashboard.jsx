import React, { useState, useEffect, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import api from "../assets/api/api";
import Chart from "../components/Chart";
import Sidebar from "../components/Sidebar";
import { getDoctorAppointments, updateAppointmentStatus } from "../assets/api/api";

import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  HeartIcon,
  MoonIcon,
  FireIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { ScaleIcon } from "@heroicons/react/24/solid";

// Metric Chip for stats
const MetricChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 text-xs">
    <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center">
      <Icon className="h-4 w-4 text-white" />
    </div>
    <div>
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="font-semibold">{value ?? "--"}</p>
    </div>
  </div>
);

// Severity Level UI
const SeverityBadge = ({ severity }) => {
  const styles = {
    emergency: "bg-red-100 text-red-700 border-red-300",
    "see-doctor": "bg-amber-100 text-amber-700 border-amber-300",
    monitor: "bg-blue-100 text-blue-700 border-blue-300",
    normal: "bg-emerald-100 text-emerald-700 border-emerald-300",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] border font-semibold ${styles[severity] || "bg-gray-100 text-gray-600"}`}>
      {severity || "N/A"}
    </span>
  );
};

const DoctorDashboard = () => {

  const { user } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientLogs, setPatientLogs] = useState([]);
  const [patientReports, setPatientReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch patients
  useEffect(() => {
  loadPatients();
  loadAppointments();
}, []);


  const loadPatients = async () => {
    try {
      const res = await api.get("/doctors/patients");
      setPatients(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await getDoctorAppointments();
      setAppointments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };


  const loadPatientData = async (id) => {
    try {
      const [logs, reports] = await Promise.all([
        api.get(`/logs/patient/${id}`),
        api.get(`/symptoms/patient/${id}`)
      ]);
      setPatientLogs(logs.data || []);
      setPatientReports(reports.data || []);
    } catch {
      setPatientLogs([]);
      setPatientReports([]);
    }
  };

  const filteredPatients = useMemo(() =>
    patients.filter((p) =>
      (p.name + p.email).toLowerCase().includes(search.toLowerCase())
    ),
  [patients, search]);

  const latest = patientLogs[0] || {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <ArrowPathIcon className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const updateStatus = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      loadAppointments(); // refresh after update
    } catch (err) {
      console.error(err);
    }
    };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
     

      <main className="flex-1 md:ml-64 px-6 py-6 relative">
        
        {/* Glow background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 left-0 w-96 h-96 bg-emerald-200/40 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-lime-200/40 blur-[130px] rounded-full" />
        </div>

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-lg p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Hello Dr. {user?.name?.split(" ")[0]} 👨‍⚕️
            </h1>
            <p className="text-gray-500 text-sm">Monitor & analyze patient health</p>
          </div>

          {/* Patient Picker button */}
          <button
            onClick={() => setShowPicker(true)}
            className="text-sm px-4 py-2 rounded-xl bg-emerald-600 text-white shadow hover:bg-emerald-500">
            Select Patient
          </button>
        </div>

        {/* No patient selected message */}
        {!selectedPatient ? (
          <div className="mt-10 text-center bg-white/70 border shadow rounded-3xl py-20">
            <p className="text-gray-500">Choose a patient to view analytics</p>
          </div>
        ) : (
          <>
            {/* Patient Info Top Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white/80 backdrop-blur-xl rounded-3xl border shadow p-6">
              
              <div className="flex justify-between flex-wrap gap-4">
                <div className="flex gap-3 items-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-200 flex items-center justify-center">
                    <UserCircleIcon className="h-6 w-6 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedPatient.name}</p>
                    <p className="text-xs text-gray-500">{selectedPatient.email}</p>
                  </div>
                </div>

                {/* Key Stats Mini Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricChip icon={HeartIcon} label="BP" value={latest.bloodPressure} />
                  <MetricChip icon={ScaleIcon} label="Sugar" value={latest.bloodSugar} />
                  <MetricChip icon={MoonIcon} label="Sleep" value={latest.sleepHours} />
                  <MetricChip icon={FireIcon} label="Exercise" value={latest.exerciseMinutes} />
                </div>
              </div>
            </motion.div>

            {/* Analytics */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Trends Chart */}
              <div className="rounded-3xl bg-white/80 backdrop-blur-xl border shadow p-6">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-800 text-sm flex items-center gap-2">
                    Health Trends
                  </h3>
                  <button
                    onClick={() => loadPatientData(selectedPatient._id)}
                    className="text-emerald-600 text-xs flex gap-1">
                    <ArrowPathIcon className="h-4 w-4 animate-spin" /> Refresh
                  </button>
                </div>
                <div className="h-64 mt-4">
                  <Chart data={patientLogs} />
                </div>
              </div>

              {/* Recent Logs */}
              <div className="rounded-3xl bg-white/80 backdrop-blur-xl border shadow p-6">
                <h3 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  Recent Logs
                </h3>

                <div className="mt-3 space-y-3 max-h-64 overflow-y-auto">
                  {patientLogs.length ? (
                    patientLogs.slice(0, 6).map((log) => (
                      <div key={log._id} className="p-3 text-xs bg-gray-50 border rounded-xl">
                        <p className="text-[10px] text-gray-500">
                          {new Date(log.date).toLocaleString()}
                        </p>

                        <div className="grid grid-cols-2 text-gray-800 gap-1 mt-1">
                          {log.bloodPressure && <span>BP: {log.bloodPressure}</span>}
                          {log.bloodSugar && <span>Sugar: {log.bloodSugar}</span>}
                          {log.sleepHours && <span>Sleep: {log.sleepHours}h</span>}
                          {log.exerciseMinutes && <span>Ex: {log.exerciseMinutes}m</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 text-center">No logs found</p>
                  )}
                </div>
              </div>
            </div>

            {/* Symptom Reports */}
            <div className="mt-8 rounded-3xl bg-white/80 backdrop-blur-xl border shadow p-6">
              <h3 className="font-medium text-sm flex items-center gap-2 text-gray-800">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
                Symptoms History
              </h3>

              <div className="mt-3 space-y-3">
                {patientReports.length ? (
                  patientReports.slice(0, 6).map((r) => (
                    <div key={r._id} className="flex justify-between border-b pb-2">
                      <div className="text-xs">
                        <p className="font-semibold text-gray-800">{r.predictedCondition}</p>
                        <p className="text-[10px] text-gray-500">{r.symptoms?.join(", ")}</p>
                        <p className="text-[9px] text-gray-400 mt-1">
                          {new Date(r.date).toLocaleString()}
                        </p>
                      </div>
                      <SeverityBadge severity={r.severity} />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No symptom history</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Patient Picker Modal */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPicker(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MagnifyingGlassIcon className="h-5 w-5" /> Select Patient
                </h3>

                <input
                  type="text"
                  className="w-full text-sm border rounded-xl px-3 py-2 bg-gray-50"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {filteredPatients.map((p) => (
                    <button
                      key={p._id}
                      className="w-full text-left text-sm border p-3 rounded-xl hover:bg-emerald-50"
                      onClick={() => {
                        setSelectedPatient(p);
                        loadPatientData(p._id);
                        setShowPicker(false);
                      }}
                    >
                      {p.name} — <span className="text-xs text-gray-500">{p.email}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
{/* Appointment Requests */}
<div className="mt-10 rounded-3xl bg-white/80 backdrop-blur-xl border shadow p-6">
  <h3 className="font-medium text-sm flex items-center gap-2 text-gray-800">
    <ClockIcon className="h-5 w-5 text-blue-600" />
    Appointment Requests
  </h3>

  <div className="mt-4 space-y-4">
    {appointments.length ? (
      appointments.map((a) => (
        <div key={a._id} className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          
          <p className="text-sm font-semibold text-gray-800">
            Patient: {a.patient?.name}
          </p>

          <p className="text-[11px] text-gray-500">
            {new Date(a.appointmentDate).toLocaleString()}
          </p>

          <p className="text-xs text-gray-700 mt-1">
            Reason: {a.reason || "Not mentioned"}
          </p>

          <span className={`
            px-2 py-1 mt-2 inline-block text-[10px] rounded-full border font-semibold
            ${
              a.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : a.status === "confirmed"
                ? "bg-green-100 text-green-700"
                : a.status === "cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-purple-100 text-purple-700"
            }
          `}>
            {a.status.toUpperCase()}
          </span>

          <div className="flex gap-2 mt-3">
            {a.status === "pending" && (
              <>
                <button
                  onClick={() => updateStatus(a._id, "confirmed")}
                  className="px-3 py-1 bg-green-600 text-white rounded-md text-xs"
                >
                  Accept
                </button>
                <button
                  onClick={() => updateStatus(a._id, "cancelled")}
                  className="px-3 py-1 bg-red-600 text-white rounded-md text-xs"
                >
                  Cancel
                </button>
              </>
            )}

            {a.status === "confirmed" && (
              <button
                onClick={() => updateStatus(a._id, "completed")}
                className="px-3 py-1 bg-purple-600 text-white rounded-md text-xs"
              >
                Completed
              </button>
            )}
          </div>

        </div>
      ))
    ) : (
      <p className="text-xs text-gray-500">No appointments yet</p>
    )}
  </div>
</div>

      </main>
    </div>
  );
};

export default DoctorDashboard;
