// src/pages/PatientDashboard.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../assets/api/api";
import Chart from "../components/Chart";
import Sidebar from "../components/Sidebar";
import {
  PlusIcon,
  ClockIcon,
  HeartIcon,
  MoonIcon,
  FireIcon,
  ScaleIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

// Small metric summary cards on top
const MetricCard = ({ title, value, icon: Icon, bgColor }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow p-4 flex items-start gap-4 border border-white/40 hover:shadow-lg transition">
    <div className={`${bgColor} p-3 rounded-xl`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <p className="text-[11px] font-medium text-gray-500">{title}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

// Emoji metric selector config
const METRIC_OPTIONS = [
  { id: "bloodPressure", label: "Blood Pressure", short: "BP", emoji: "🩸" },
  { id: "bloodSugar", label: "Blood Sugar", short: "Sugar", emoji: "🍬" },
  { id: "sleepHours", label: "Sleep", short: "Sleep", emoji: "😴" },
  { id: "exerciseMinutes", label: "Activity", short: "Activity", emoji: "🏃" },
];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [healthLogs, setHealthLogs] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("bloodPressure");

  const [newLog, setNewLog] = useState({
    bloodPressure: "",
    bloodSugar: "",
    sleepHours: "",
    exerciseMinutes: "",
    dietNotes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/logs/patient/me");
      setHealthLogs(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/logs", newLog);
      setNewLog({
        bloodPressure: "",
        bloodSugar: "",
        sleepHours: "",
        exerciseMinutes: "",
        dietNotes: "",
      });
      fetchData();
    } catch (err) {
      console.error("Log error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <ArrowPathIcon className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const latest = healthLogs[0] || {};

  const activeMetricConfig =
    METRIC_OPTIONS.find((m) => m.id === selectedMetric) || METRIC_OPTIONS[0];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-gray-900">
      {/* Sidebar on the left */}
   

      <main className="flex-1 md:ml-64 px-6 pt-6 pb-20 relative overflow-y-auto">
        {/* Glow Orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
          <div className="absolute -top-20 left-0 w-72 h-72 bg-emerald-200 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-lime-200 blur-[130px] rounded-full" />
        </div>

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-lg">
          <h1 className="text-2xl font-semibold">
            Welcome, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500">
            Track & monitor your daily health status
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/health-calendar")}
              className="flex items-center px-4 py-2 border border-emerald-300 text-emerald-700 rounded-xl hover:bg-emerald-50 transition"
            >
              <CalendarDaysIcon className="h-5 w-5 mr-2" />
              Calendar
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("add-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg hover:bg-emerald-500 transition"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Log
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Blood Pressure"
            value={latest.bloodPressure || "--/--"}
            icon={HeartIcon}
            bgColor="bg-emerald-600"
          />
          <MetricCard
            title="Blood Sugar"
            value={
              latest.bloodSugar ? `${latest.bloodSugar} mg/dL` : "--"
            }
            icon={ScaleIcon}
            bgColor="bg-emerald-500"
          />
          <MetricCard
            title="Sleep"
            value={latest.sleepHours ? `${latest.sleepHours} hrs` : "--"}
            icon={MoonIcon}
            bgColor="bg-emerald-400"
          />
          <MetricCard
            title="Exercise"
            value={
              latest.exerciseMinutes
                ? `${latest.exerciseMinutes} min`
                : "--"
            }
            icon={FireIcon}
            bgColor="bg-lime-500"
          />
        </div>

        {/* Logs + Chart */}
        <div className="mt-10 grid lg:grid-cols-2 gap-8">
          {/* Logs */}
          <div className="rounded-3xl p-6 bg-white/80 backdrop-blur-xl shadow-lg border border-white/40">
            <h3 className="flex items-center text-lg font-semibold">
              <ClockIcon className="h-5 w-5 mr-2 text-emerald-600" />
              Recent Logs
            </h3>
            <div className="mt-4 space-y-4">
              {healthLogs.length ? (
                healthLogs.slice(0, 5).map((log) => (
                  <div
                    key={log._id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs hover:bg-emerald-50 transition"
                  >
                    <p className="text-gray-500">
                      {new Date(log.date).toLocaleString()}
                    </p>
                    {log.bloodPressure && <p>🩸 {log.bloodPressure}</p>}
                    {log.bloodSugar && (
                      <p>🍬 {log.bloodSugar} mg/dL</p>
                    )}
                    {log.sleepHours && (
                      <p>😴 {log.sleepHours} hrs</p>
                    )}
                    {log.exerciseMinutes && (
                      <p>🏃 {log.exerciseMinutes} min</p>
                    )}
                    {log.dietNotes && <p>🍽 {log.dietNotes}</p>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  No logs yet
                </p>
              )}
            </div>
          </div>

          {/* Chart + Metric Switcher */}
          <div className="rounded-3xl p-6 bg-white/80 backdrop-blur-xl shadow-lg border border-white/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  📈 {activeMetricConfig.label} Trend
                </h3>
                <p className="text-[11px] text-gray-500">
                  Last {healthLogs.length} entries
                </p>
              </div>

              {/* Emoji metric selector */}
              <div className="flex gap-2">
                {METRIC_OPTIONS.map((metric) => {
                  const isActive = metric.id === selectedMetric;
                  return (
                    <button
                      key={metric.id}
                      type="button"
                      onClick={() => setSelectedMetric(metric.id)}
                      className={`flex flex-col items-center justify-center text-xs px-2 py-1 rounded-xl border transition
                        ${
                          isActive
                            ? "bg-emerald-500 text-white border-emerald-500 shadow"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-emerald-50"
                        }`}
                    >
                      <span className="text-base leading-none">
                        {metric.emoji}
                      </span>
                      <span className="mt-0.5 text-[10px]">
                        {metric.short}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chart – assumes Chart supports metric prop (you can wire it inside Chart.jsx) */}
            <div className="h-72 mt-2">
              <Chart data={healthLogs} metric={selectedMetric} />
            </div>

            <button
              onClick={fetchData}
              className="mt-4 flex items-center gap-2 text-emerald-600 text-sm hover:opacity-80"
            >
              <ArrowPathIcon className="h-4 w-4 animate-spin-slow" />
              Refresh
            </button>
          </div>
        </div>

        {/* Add Log */}
        <div
          id="add-section"
          className="mt-10 p-6 rounded-3xl bg-white/80 backdrop-blur-xl shadow-lg border border-white/40"
        >
          <h3 className="text-lg font-semibold flex items-center">
            <PlusIcon className="h-5 w-5 mr-2 text-emerald-600" />
            Add New Log
          </h3>

          <form
            onSubmit={handleSubmit}
            className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {["bloodPressure", "bloodSugar", "sleepHours", "exerciseMinutes"].map(
              (field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field.replace(/([A-Z])/g, " $1")}
                  value={newLog[field]}
                  onChange={(e) =>
                    setNewLog({ ...newLog, [field]: e.target.value })
                  }
                  className="border-gray-300 rounded-xl p-2 text-sm bg-white/70 border focus:ring-emerald-500 focus:ring-2 outline-none"
                />
              )
            )}

            <textarea
              placeholder="Diet Notes…"
              rows="3"
              value={newLog.dietNotes}
              onChange={(e) =>
                setNewLog({ ...newLog, dietNotes: e.target.value })
              }
              className="md:col-span-2 border-gray-300 rounded-xl p-2 text-sm bg-white/70 border focus:ring-emerald-500 focus:ring-2 outline-none"
            />

            <button className="md:col-span-2 bg-emerald-600 text-white px-5 py-2 rounded-xl shadow hover:bg-emerald-500">
              Save Entry
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
