import React, { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import api from "../assets/api/api";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ClockIcon,
  HeartIcon,
  ScaleIcon,
  MoonIcon,
  FireIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

// Helper: format date as YYYY-MM-DD
const getDateKey = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10);
};

// Small badge in modal
const MetricBadge = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-2 text-xs bg-white/70 border border-white/60 rounded-xl px-3 py-2">
    <div className={`h-7 w-7 rounded-full flex items-center justify-center ${color}`}>
      <Icon className="h-4 w-4 text-white" />
    </div>
    <div>
      <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="font-semibold text-slate-800">{value ?? "—"}</p>
    </div>
  </div>
);

const HealthCalendar = () => {
  const { user } = useContext(AuthContext);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDayKey, setSelectedDayKey] = useState(null);

  // Fetch logs once
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/logs/patient/me");
        setLogs(res.data || []);
      } catch (err) {
        console.error("Calendar fetch error:", err);
        setError("Unable to load logs.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Group logs by day + build daily summary
  const dailyMap = useMemo(() => {
    const map = {};

    logs.forEach((log) => {
      const key = getDateKey(log.date);
      if (!key) return;

      if (!map[key]) {
        map[key] = {
          date: new Date(log.date),
          logs: [],
          summary: {
            bp: null,
            sugarAvg: null,
            sleepAvg: null,
            activityTotal: null,
            dietNotes: [],
          },
        };
      }
      map[key].logs.push(log);
    });

    Object.values(map).forEach((day) => {
      const { logs } = day;
      let lastBP = null;
      const sugarVals = [];
      const sleepVals = [];
      const activityVals = [];
      const notes = [];

      logs.forEach((log) => {
        if (log.bloodPressure) lastBP = log.bloodPressure;

        const sugar = Number(log.bloodSugar);
        if (!Number.isNaN(sugar) && log.bloodSugar !== "") sugarVals.push(sugar);

        const sleep = Number(log.sleepHours);
        if (!Number.isNaN(sleep) && log.sleepHours !== "") sleepVals.push(sleep);

        const act = Number(log.exerciseMinutes);
        if (!Number.isNaN(act) && log.exerciseMinutes !== "") activityVals.push(act);

        if (log.dietNotes) notes.push(log.dietNotes);
      });

      const avg = (arr) =>
        arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

      day.summary = {
        bp: lastBP,
        sugarAvg: sugarVals.length ? `${avg(sugarVals)} mg/dL` : null,
        sleepAvg: sleepVals.length ? `${avg(sleepVals)} hrs` : null,
        activityTotal: activityVals.length ? `${activityVals.reduce((a, b) => a + b, 0)} min` : null,
        dietNotes: notes,
      };
    });

    return map;
  }, [logs]);

  // Helpers for calendar grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = currentMonth.getDay(); // 0 = Sun

  const monthLabel = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const daysArray = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstWeekday; i++) {
      arr.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(new Date(year, month, d));
    }
    return arr;
  }, [firstWeekday, daysInMonth, year, month]);

  const weeks = useMemo(() => {
    const rows = [];
    for (let i = 0; i < daysArray.length; i += 7) {
      rows.push(daysArray.slice(i, i + 7));
    }
    return rows;
  }, [daysArray]);

  const goPrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDayKey(null);
  };

  const goNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDayKey(null);
  };

  const goToday = () => {
    const d = new Date();
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelectedDayKey(getDateKey(d));
  };

  const selectedDayData = selectedDayKey ? dailyMap[selectedDayKey] : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
        <ArrowPathIcon className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      

      <main className="flex-1 md:ml-64 px-6 pt-6 pb-20 relative overflow-y-auto">
        {/* Soft background glows */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-10 w-72 h-72 bg-emerald-200/50 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-lime-200/40 blur-[130px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-lg flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <CalendarDaysIcon className="h-6 w-6 text-emerald-600" />
                Health Calendar
              </h1>
              <p className="text-sm text-slate-500">
                Visualize your logs by day and quickly spot patterns.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Logged as <span className="font-medium text-slate-800">{user?.email}</span>
            </div>
          </header>

          {/* Summary strip for current month */}
          <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 border border-white/40 shadow">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              This month at a glance
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Simple month summaries; you can later make these real statistics */}
              <div className="bg-white/70 border border-white/60 rounded-xl px-3 py-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Active Days
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {
                    Object.keys(dailyMap).filter((k) => {
                      const d = new Date(k);
                      return d.getMonth() === month && d.getFullYear() === year;
                    }).length
                  }
                </p>
              </div>
              <div className="bg-white/70 border border-white/60 rounded-xl px-3 py-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Latest BP
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {(() => {
                    // last non-empty BP from all logs
                    for (let i = 0; i < logs.length; i++) {
                      const log = logs[i];
                      if (log.bloodPressure) return log.bloodPressure;
                    }
                    return "—";
                  })()}
                </p>
              </div>
              <div className="bg-white/70 border border-white/60 rounded-xl px-3 py-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Last Sleep
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {(() => {
                    for (let i = 0; i < logs.length; i++) {
                      const log = logs[i];
                      if (log.sleepHours) return `${log.sleepHours} hrs`;
                    }
                    return "—";
                  })()}
                </p>
              </div>
              <div className="bg-white/70 border border-white/60 rounded-xl px-3 py-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Last Activity
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {(() => {
                    for (let i = 0; i < logs.length; i++) {
                      const log = logs[i];
                      if (log.exerciseMinutes)
                        return `${log.exerciseMinutes} min`;
                    }
                    return "—";
                  })()}
                </p>
              </div>
            </div>
          </section>

          {/* Calendar Card */}
          <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-lg">
            {/* Month controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={goPrevMonth}
                  className="p-1.5 rounded-full border border-emerald-100 hover:bg-emerald-50"
                >
                  <ChevronLeftIcon className="h-4 w-4 text-emerald-700" />
                </button>
                <button
                  onClick={goNextMonth}
                  className="p-1.5 rounded-full border border-emerald-100 hover:bg-emerald-50"
                >
                  <ChevronRightIcon className="h-4 w-4 text-emerald-700" />
                </button>
                <p className="text-sm font-semibold text-slate-900">{monthLabel}</p>
              </div>

              <button
                onClick={goToday}
                className="px-3 py-1.5 rounded-xl text-xs border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                Today
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> BP
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Sugar
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-violet-500" /> Sleep
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Activity
              </span>
            </div>

            {/* Weekday header */}
            <div className="grid grid-cols-7 text-[11px] text-center text-slate-400 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
                <div key={w} className="py-1">
                  {w}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="space-y-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1">
                  {week.map((day, di) => {
                    if (!day) {
                      return <div key={di} className="h-16 rounded-2xl" />;
                    }

                    const key = getDateKey(day);
                    const dayData = dailyMap[key];
                    const isToday = key === getDateKey(today);
                    const isSelected = key === selectedDayKey;
                    const inCurrentMonth =
                      day.getMonth() === month && day.getFullYear() === year;

                    const hasBP = !!dayData?.summary.bp;
                    const hasSugar = !!dayData?.summary.sugarAvg;
                    const hasSleep = !!dayData?.summary.sleepAvg;
                    const hasAct = !!dayData?.summary.activityTotal;

                    return (
                      <button
                        key={di}
                        type="button"
                        onClick={() => dayData && setSelectedDayKey(key)}
                        className={`h-16 rounded-2xl flex flex-col items-center justify-between px-1.5 py-1.5 text-xs transition
                          ${
                            dayData
                              ? "bg-emerald-50/70 border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50"
                              : "bg-white/60 border border-white/60 hover:border-emerald-100 hover:bg-emerald-50/40"
                          }
                          ${
                            isSelected
                              ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-emerald-50"
                              : ""
                          }
                          ${!inCurrentMonth ? "opacity-40" : ""}
                        `}
                      >
                        <span
                          className={`text-[11px] ${
                            isToday ? "font-semibold text-emerald-700" : "text-slate-700"
                          }`}
                        >
                          {day.getDate()}
                        </span>

                        {/* Colored dots */}
                        <div className="flex gap-1 mt-1">
                          {hasBP && (
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          )}
                          {hasSugar && (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          )}
                          {hasSleep && (
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                          )}
                          {hasAct && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          )}
                        </div>

                        {/* Small label if logs exist */}
                        {dayData && (
                          <span className="mt-1 text-[9px] text-emerald-700/80 flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {dayData.logs.length} logs
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>

          {/* Modal for selected day */}
          {selectedDayData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="bg-white/90 rounded-3xl shadow-2xl max-w-lg w-full mx-4 border border-white/60 p-6 relative">
                <button
                  onClick={() => setSelectedDayKey(null)}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-100"
                >
                  <XMarkIcon className="h-5 w-5 text-slate-500" />
                </button>

                <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                  <CalendarDaysIcon className="h-4 w-4 text-emerald-600" />
                  {selectedDayData.date.toLocaleDateString(undefined, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Daily Summary
                </h2>

                {/* Summary metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <MetricBadge
                    icon={HeartIcon}
                    label="Blood Pressure"
                    value={selectedDayData.summary.bp || "—"}
                    color="bg-rose-500"
                  />
                  <MetricBadge
                    icon={ScaleIcon}
                    label="Blood Sugar"
                    value={selectedDayData.summary.sugarAvg || "—"}
                    color="bg-amber-400"
                  />
                  <MetricBadge
                    icon={MoonIcon}
                    label="Sleep (avg)"
                    value={selectedDayData.summary.sleepAvg || "—"}
                    color="bg-violet-500"
                  />
                  <MetricBadge
                    icon={FireIcon}
                    label="Activity (total)"
                    value={selectedDayData.summary.activityTotal || "—"}
                    color="bg-emerald-500"
                  />
                </div>

                {/* Diet notes (merged) */}
                {selectedDayData.summary.dietNotes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-700 mb-1">
                      Diet Notes
                    </p>
                    <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1 max-h-32 overflow-y-auto">
                      {selectedDayData.summary.dietNotes.map((note, i) => (
                        <p key={i}>• {note}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw logs list (still shown but merged summary is primary) */}
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    Individual Logs ({selectedDayData.logs.length})
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto text-[11px]">
                    {selectedDayData.logs.map((log) => (
                      <div
                        key={log._id}
                        className="border border-slate-200 rounded-2xl px-3 py-2 bg-white/70"
                      >
                        <p className="text-slate-500 mb-1 flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          {new Date(log.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                          {log.bloodPressure && <span>BP: {log.bloodPressure}</span>}
                          {log.bloodSugar && (
                            <span>Sugar: {log.bloodSugar} mg/dL</span>
                          )}
                          {log.sleepHours && (
                            <span>Sleep: {log.sleepHours} hrs</span>
                          )}
                          {log.exerciseMinutes && (
                            <span>Activity: {log.exerciseMinutes} min</span>
                          )}
                        </div>
                        {log.dietNotes && (
                          <p className="mt-1 text-slate-600">
                            🍽 {log.dietNotes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 mt-2 text-center">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default HealthCalendar;
