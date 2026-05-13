import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDoctorsByCondition } from "../assets/api/api";

const DoctorList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const condition = new URLSearchParams(location.search).get("condition") || "";

  const [doctors, setDoctors] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await getDoctorsByCondition(condition.toLowerCase().trim());

        if (Array.isArray(res.data)) {
          setDoctors(res.data);
          setMessage("");
        } else {
          setDoctors([]);
          setMessage(res.data.message || "No doctors found");
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setMessage("Server Error while fetching doctors");
      }
    };

    if (condition) fetchDoctors();
  }, [condition]);

  const handleBookClick = (doctor) => {
    navigate(
      `/book-appointment?doctorId=${doctor._id}&doctorName=${encodeURIComponent(
        doctor.name
      )}`
    );
  };

  return (
    <div className="min-h-screen bg-emerald-50 py-10 px-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md border border-emerald-200">
        <h2 className="text-2xl font-bold text-emerald-800 mb-4 text-center">
          Doctors for: {condition}
        </h2>

        {message && (
          <p className="text-center text-gray-600 font-medium">{message}</p>
        )}

        {!message && doctors.length === 0 && (
          <p className="text-center text-gray-600 font-medium">
            Searching doctors...
          </p>
        )}

        <div className="space-y-4 mt-4">
          {doctors.map((doc, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border border-emerald-300 shadow-sm bg-emerald-50"
            >
              <h3 className="text-lg font-bold text-emerald-700">
                {doc.name}
              </h3>
              <p className="text-gray-700">🏥 {doc.hospital}</p>
              <p className="text-gray-700">🩺 {doc.specialty}</p>
              <p className="text-gray-700">📧 {doc.email}</p>
              <a
                href={`tel:${doc.phone}`}
                className="text-blue-600 underline font-medium inline-block mt-2 mr-3"
              >
                📞 Call: {doc.phone}
              </a>

              <button
                onClick={() => handleBookClick(doc)}
                className="mt-2 inline-block bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700"
              >
                📅 Book Appointment
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorList;
