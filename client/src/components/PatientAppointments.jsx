import React, { useEffect, useState } from "react";
import { getMyAppointments } from "../assets/api/api";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  const loadData = async () => {
    const res = await getMyAppointments();
    setAppointments(res.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-yellow-100 text-yellow-700"; // pending
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-emerald-800 mb-4 text-center">
          My Appointments
        </h2>

        {appointments.length === 0 ? (
          <p className="text-center text-gray-500">No appointments yet</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((a) => (
              <div key={a._id} className="p-4 bg-gray-50 border rounded-xl">
                
                <p className="font-semibold text-gray-800">
                  {a.doctor?.name} ({a.doctor?.specialty})
                </p>

                <p className="text-sm text-gray-600">
                  {new Date(a.appointmentDate).toLocaleString()}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Reason: {a.reason || "-"}
                </p>

                <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClass(a.status)}`}>
                  {a.status.toUpperCase()}
                </span>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;
