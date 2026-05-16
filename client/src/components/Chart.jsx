import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const METRIC_COLORS = {
  bloodSugar: { stroke: "#8b5cf6", fill: "url(#gradSugar)" },
  sleepHours: { stroke: "#06b6d4", fill: "url(#gradSleep)" },
  exerciseMinutes: { stroke: "#f59e0b", fill: "url(#gradExercise)" },
  bloodPressure: { stroke: "#f43f5e", fill: "url(#gradBP)" },
};

const Chart = ({ data, metric }) => {
  const dataKey = metric && metric !== "bloodPressure" ? metric : "bloodSugar";

  const chartData = data.slice(-10).map((log) => {
    let value = log[dataKey] || 0;
    if (metric === "bloodPressure" && log.bloodPressure) {
      const parts = String(log.bloodPressure).split("/");
      value = parts[0] ? Number(parts[0]) : 0;
    }
    return {
      date: new Date(log.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      value: Number(value) || 0,
      bloodSugar: log.bloodSugar || 0,
      sleepHours: log.sleepHours || 0,
      exerciseMinutes: log.exerciseMinutes || 0,
    };
  });

  const colors = METRIC_COLORS[dataKey] || METRIC_COLORS.bloodSugar;
  const displayKey = metric === "bloodPressure" ? "value" : dataKey;

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
        <p className="text-sm text-slate-400">Add logs to see trends</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="gradSugar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradSleep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradExercise" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradBP" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "rgba(255,255,255,0.95)",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            fontSize: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        />
        <Area
          type="monotone"
          dataKey={displayKey}
          stroke={colors.stroke}
          strokeWidth={2.5}
          fill={colors.fill}
          dot={{ r: 4, fill: colors.stroke, strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default Chart;
