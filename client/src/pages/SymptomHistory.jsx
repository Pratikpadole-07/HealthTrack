import React, { useEffect, useState } from "react";
import api from "../assets/api/api";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { generateSymptomPDF } from "../utils/generateSymptomPDF";

const severityStyles = {
  emergency: "bg-red-100 text-red-700 border-red-200",
  "see-doctor": "bg-amber-100 text-amber-700 border-amber-200",
  mild: "bg-blue-100 text-blue-700 border-blue-200",
  normal: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function SymptomHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/symptoms/patient/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📌 HISTORY RESPONSE:", res.data);
      setReports(res.data || []);
    } catch (err) {
      console.error("❌ Fetch Failed:", err.response?.data || err.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white">
        <ArrowPathIcon className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <main className="flex-1 md:ml-64 p-6 relative overflow-y-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/40 p-6">
          <h1 className="text-2xl font-semibold text-gray-900">Symptom History 🩺</h1>
          <p className="text-sm text-gray-500">View your saved AI health insights</p>

          <button
            onClick={fetchReports}
            className="mt-4 flex items-center text-emerald-600 text-sm font-medium hover:text-emerald-800 transition"
          >
            <ArrowPathIcon className="h-5 w-5 mr-1" />
            Refresh
          </button>
        </div>

        <div className="mt-10 space-y-6">
          {reports.length === 0 && (
            <p className="text-sm text-gray-500 text-center">No symptom history found.</p>
          )}

          {reports.map((report) => (
            <div
              key={report._id}
              className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-md"
            >
              <div className="flex justify-between flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm capitalize">
                    {report.predictedCondition || "Unknown Condition"}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {new Date(report.date).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] border font-medium capitalize ${
                    severityStyles[report.severity] || severityStyles.normal
                  }`}
                >
                  {report.severity === "emergency" && (
                    <ExclamationTriangleIcon className="h-3 w-3" />
                  )}
                  {report.severity === "see-doctor" && (
                    <InformationCircleIcon className="h-3 w-3" />
                  )}
                  {(report.severity === "mild" || report.severity === "normal") && (
                    <CheckCircleIcon className="h-3 w-3" />
                  )}
                  {report.severity}
                </span>
              </div>

              {/* Symptoms */}
              <p className="text-xs text-gray-600 mt-3">
                <span className="font-medium text-gray-700">Symptoms:</span>{" "}
                {Array.isArray(report.symptoms) && report.symptoms.length > 0
                  ? report.symptoms.join(", ")
                  : "Not recorded"}
              </p>

              {/* Expand */}
              {report.selfCareTips?.length > 0 && (
                <>
                  <button
                    onClick={() =>
                      setExpanded(expanded === report._id ? null : report._id)
                    }
                    className="mt-2 text-[11px] text-emerald-600 font-medium hover:underline"
                  >
                    {expanded === report._id ? "Hide Tips ▲" : "Show Self-Care Tips ▼"}
                  </button>

                  {expanded === report._id && (
                    <ul className="mt-2 list-disc pl-5 text-[11px] text-gray-600 space-y-1">
                      {report.selfCareTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {/* PDF Download */}
              <button
                onClick={() => generateSymptomPDF(report)}
                className="mt-3 flex items-center text-[11px] text-blue-600 font-medium hover:text-blue-800 transition"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                Download PDF
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
