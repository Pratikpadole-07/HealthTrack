import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getDoctors } from "../assets/api/api";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    assignedDoctor: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const data = await getDoctors();
      setDoctors(Array.isArray(data) ? data : []);
    })();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.role.toUpperCase(),
      formData.assignedDoctor || undefined
    );

    if (result.success) {
      if (result.user.role === "DOCTOR") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/patient-dashboard");
      }
    } else {
      setError(result.message || "Something went wrong ❌");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center px-4">
      {/* Glow */}
      <div className="absolute inset-0 overflow-hidden -z-10 opacity-60">
        <div className="absolute -top-28 left-0 w-96 h-96 bg-emerald-200/50 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-lime-200/50 blur-[120px]" />
      </div>

      <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl rounded-3xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">Create Account</h2>
        <p className="text-sm text-gray-500 text-center mt-1">Start your health journey</p>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
          <input
            name="name"
            placeholder="Full Name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-3 rounded-xl border border-gray-300 bg-white/70 focus:ring-2 focus:ring-emerald-600 outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-3 rounded-xl border border-gray-300 bg-white/70 focus:ring-2 focus:ring-emerald-600 outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Create Password"
            minLength="6"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-3 rounded-xl border border-gray-300 bg-white/70 focus:ring-2 focus:ring-emerald-600 outline-none"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-3 rounded-xl border border-gray-300 bg-white/70 focus:ring-2 focus:ring-emerald-600 outline-none"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Healthcare Provider</option>
          </select>

          {formData.role === "patient" && (
            <select
              name="assignedDoctor"
              value={formData.assignedDoctor}
              onChange={handleChange}
              className="w-full px-3 py-3 rounded-xl border border-gray-300 bg-white/70 focus:ring-2 focus:ring-emerald-600 outline-none"
            >
              <option value="">Select Personal Doctor (Optional)</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  Dr. {doc.name} ({doc.specialization || "General"})
                </option>
              ))}
            </select>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow disabled:opacity-50"
          >
            {isLoading && <ArrowPathIcon className="h-5 w-5 animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="mt-4 text-xs text-center text-gray-500">
          Already a member?{" "}
          <Link to="/login" className="text-emerald-600 font-medium hover:text-emerald-700">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
