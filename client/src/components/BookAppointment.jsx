import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createAppointment } from "../assets/api/api";

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

      setStatusMsg("✅ Appointment booked successfully!");
      setTimeout(() => {
        navigate("/appointments"); // you can create a 'MyAppointments' page later
      }, 800);
    } catch (err) {
      console.error("Error booking:", err);
      setStatusMsg("❌ Failed to book appointment. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-emerald-200 p-6">
        <h2 className="text-2xl font-bold text-emerald-800 mb-4 text-center">
          Book Appointment
        </h2>
        <p className="text-center text-gray-700 mb-4">
          With: <span className="font-semibold">{doctorName}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (optional)
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows="3"
              placeholder="Describe your issue briefly"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {statusMsg && (
            <p
              className={`text-sm text-center ${
                statusMsg.startsWith("✅") ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {statusMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
