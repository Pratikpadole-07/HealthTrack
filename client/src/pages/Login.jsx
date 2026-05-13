import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate(result.user.role === "patient" ? "/patient-dashboard" : "/doctor-dashboard");
    } else {
      setError(result.message || "Invalid credentials ❌");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center px-4">
      {/* Glow BG */}
      <div className="absolute inset-0 overflow-hidden -z-10 opacity-60">
        <div className="absolute -top-28 left-0 w-96 h-96 bg-emerald-200/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-lime-200/50 blur-[120px] rounded-full" />
      </div>

      <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl rounded-3xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">Welcome Back</h2>
        <p className="text-sm text-gray-500 text-center mt-1">Sign in to continue</p>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
          <input
            type="email"
            name="email"
            required
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-3 rounded-xl text-sm border border-gray-300 bg-white/70 focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          <input
            type="password"
            name="password"
            required
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-3 rounded-xl text-sm border border-gray-300 bg-white/70 focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md disabled:opacity-60"
          >
            {isLoading && <ArrowPathIcon className="h-5 w-5 animate-spin" />}
            Sign In
          </button>
        </form>

        <p className="mt-4 text-xs text-center text-gray-500">
          Don’t have an account?{" "}
          <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
