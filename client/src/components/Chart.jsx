import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  HeartIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

const Chart = ({ data }) => {
  const chartData = data.slice(-10).map((log) => ({
    date: new Date(log.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    }),
    bloodSugar: log.bloodSugar || 0,
    sleepHours: log.sleepHours || 0,
    exerciseMinutes: log.exerciseMinutes || 0
  }));

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-blue-600" />
          Health Trends
        </h3>
        <p className="text-xs text-gray-400">Last 10 Logs</p>
      </div>

      {chartData.length === 0 ? (
        <p className="text-gray-500 text-sm">Not enough data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} style={{ fontSize: "12px" }}>
            <defs>
              <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="colorExercise" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 3" stroke="#E2E8F0" />

            <XAxis
              dataKey="date"
              tick={{ fill: "#6B7280" }}
              tickLine={false}
            />
            <YAxis tick={{ fill: "#6B7280" }} tickLine={false} />

            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />

            <Legend wrapperStyle={{ paddingTop: "12px" }} />

            <Line
              type="monotone"
              dataKey="bloodSugar"
              stroke="url(#colorSugar)"
              strokeWidth={3}
              dot={{ r: 3, fill: "#6366F1" }}
              activeDot={{ r: 5 }}
              name="Blood Sugar"
            />
            <Line
              type="monotone"
              dataKey="sleepHours"
              stroke="url(#colorSleep)"
              strokeWidth={3}
              dot={{ r: 3, fill: "#22C55E" }}
              name="Sleep Hours"
            />
            <Line
              type="monotone"
              dataKey="exerciseMinutes"
              stroke="url(#colorExercise)"
              strokeWidth={3}
              dot={{ r: 3, fill: "#F59E0B" }}
              name="Exercise (mins)"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default Chart;
