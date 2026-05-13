import React, { useState, useRef, useContext, useEffect } from "react";
import {
  XMarkIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import api from "../assets/api/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/* ================= SEVERITY MAP ================= */

const severityLevels = {
  emergency: {
    label: "Emergency",
    icon: <ExclamationCircleIcon className="h-4 w-4 text-red-600" />,
    class: "bg-red-100 text-red-800 border-red-400",
  },
  "see-doctor": {
    label: "See Doctor",
    icon: <InformationCircleIcon className="h-4 w-4 text-amber-600" />,
    class: "bg-amber-100 text-amber-800 border-amber-400",
  },
  mild: {
    label: "Mild",
    icon: <CheckCircleIcon className="h-4 w-4 text-emerald-600" />,
    class: "bg-emerald-100 text-emerald-800 border-emerald-400",
  },
};

/* ================= COMMON SYMPTOMS ================= */

const commonSymptoms = [
  "Fever",
  "Cough",
  "Headache",
  "Fatigue",
  "Nausea",
  "Vomiting",
  "Sore Throat",
  "Chest Pain",
  "Shortness of Breath",
  "Dizziness",
];

/* ================= COMPONENT ================= */

const SymptomChecker = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [symptoms, setSymptoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const inputRef = useRef(null);

  /* ===== BLOCK DOCTORS ===== */
  useEffect(() => {
    if (user?.role === "DOCTOR") {
      navigate("/doctor-dashboard");
    }
  }, [user, navigate]);

  /* ================= HANDLERS ================= */

  const addSymptom = (symptom) => {
    const formatted = symptom.trim();
    if (!formatted || symptoms.includes(formatted)) return;
    setSymptoms((prev) => [...prev, formatted]);
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const removeSymptom = (s) =>
    setSymptoms((prev) => prev.filter((x) => x !== s));

  const checkSymptoms = async () => {
    if (!symptoms.length) return;

    setLoadingCheck(true);
    setPrediction(null);
    setStatusMsg("");

    try {
      const res = await api.post("/symptoms/predict", { symptoms });
      setPrediction(res.data);

      setTimeout(() => {
        document
          .getElementById("results-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch {
      setStatusMsg("❌ Analysis failed. Please try again.");
    } finally {
      setLoadingCheck(false);
    }
  };

  const saveReport = async () => {
    if (!prediction) return;

    setLoadingSave(true);
    try {
      await api.post("/symptoms", {
        symptoms,
        predictedCondition: prediction.condition,
        severity: prediction.severity,
        confidence: prediction.confidence ?? 0.7,
        selfCareTips: prediction.selfCareTips ?? [],
      });

      setStatusMsg("✔ Report saved");
      setTimeout(() => navigate("/symptom-history"), 700);
    } catch {
      setStatusMsg("❌ Failed to save report");
    } finally {
      setLoadingSave(false);
    }
  };

  const reset = () => {
    setSymptoms([]);
    setPrediction(null);
    setStatusMsg("");
  };

  const severity =
    severityLevels[prediction?.severity] ?? severityLevels.mild;

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex justify-center py-10 bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <main className="w-full max-w-4xl px-4 space-y-10">

        {/* HEADER */}
        <header className="bg-white p-6 rounded-3xl shadow border">
          <h1 className="text-3xl font-bold text-emerald-800 flex items-center gap-3">
            <ChatBubbleLeftRightIcon className="h-8 w-8" />
            AI Symptom Checker
          </h1>
          <p className="text-gray-600 mt-2">
            Enter symptoms to receive AI-assisted health guidance.
          </p>
        </header>

        {/* INPUT */}
        <section className="bg-white p-8 rounded-3xl shadow border space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchTerm.trim()) addSymptom(searchTerm);
            }}
            className="flex gap-3"
          >
            <input
              ref={inputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type a symptom"
              className="flex-1 px-4 py-3 border rounded-xl"
            />
            <button className="px-6 bg-emerald-600 text-white rounded-xl">
              Add
            </button>
          </form>

          {!searchTerm && (
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((s) => (
                <span
                  key={s}
                  onClick={() => addSymptom(s)}
                  className="cursor-pointer px-3 py-1 text-sm bg-emerald-50 border rounded-lg"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {symptoms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {symptoms.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full"
                >
                  {s}
                  <XMarkIcon
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => removeSymptom(s)}
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={checkSymptoms}
            disabled={!symptoms.length || loadingCheck}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold"
          >
            {loadingCheck ? "Analyzing..." : "Check Symptoms"}
          </button>

          {statusMsg && (
            <p className="text-sm text-center text-gray-700">{statusMsg}</p>
          )}
        </section>

        {/* RESULTS */}
        {prediction && (
          <section
            id="results-section"
            className="bg-white p-8 rounded-3xl shadow border space-y-6"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <span
                className={`px-4 py-2 rounded-full border ${severity.class} flex items-center gap-2`}
              >
                {severity.icon} {severity.label}
              </span>
            </div>

            <p className="text-lg">
              Possible Condition:{" "}
              <strong className="text-emerald-700">
                {prediction.condition}
              </strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={reset}
                className="flex-1 border py-3 rounded-xl"
              >
                New Check
              </button>

              {/* FIND DOCTORS ONLY IF SPECIALTY EXISTS */}
              {prediction.specialty && (
                <button
                  onClick={() =>
                    navigate(`/doctors/by-specialty/${prediction.specialty}`)
                  }
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl"
                >
                  Find Doctors
                </button>
              )}

              <button
                onClick={saveReport}
                disabled={loadingSave}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl"
              >
                {loadingSave ? "Saving..." : "Save Report"}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default SymptomChecker;
