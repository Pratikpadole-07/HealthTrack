import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../assets/api/api";
import Sidebar from "../components/Sidebar";
import {
  UserCircleIcon,
  AtSymbolIcon,
  PhoneIcon,
  CameraIcon,
  LockClosedIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

// UI Input Component
const TextInput = ({ label, name, type = "text", value, onChange, icon: Icon }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-700">{label}</label>
    <div className="relative">
      {Icon && <Icon className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border border-gray-300 text-sm py-2 bg-white/70 focus:ring-2 focus:ring-emerald-500 ${
          Icon ? "pl-10 pr-3" : "px-3"
        }`}
      />
    </div>
  </div>
);

const PasswordStrengthMeter = ({ strength }) => {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-emerald-600",
  ];
  return (
    <div className="flex gap-1 mt-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full ${
            i < strength ? colors[strength - 1] : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
};

export default function ProfileDoctor() {
  const { user, updateUser } = useContext(AuthContext);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [patientCount, setPatientCount] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [profileImage, setProfileImage] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const calcStrength = (pwd) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  useEffect(() => {
    if (!user) return;
    setForm({
      ...form,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      specialization: user.specialization || "",
    });
    setProfileImage(user.profileImage);
  }, [user]);

  useEffect(() => {
    api.get("/doctors/patients").then((res) => setPatientCount(res.data.length));
  }, []);

  const updateProfile = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (!["currentPassword", "newPassword", "confirmPassword"].includes(k)) {
          fd.append(k, v);
        }
      });
      if (fileRef.current?.files[0]) {
        fd.append("profileImage", fileRef.current?.files[0]);
      }

      const res = await api.put("/auth/profile", fd);
      updateUser(res.data.user);
      setToast({ type: "success", text: "Profile Updated ✔️" });
    } catch {
      setToast({ type: "error", text: "Update failed ❌" });
    }
    setLoading(false);
    setTimeout(() => setToast(null), 3000);
  };

  const updatePassword = async () => {
    if (form.newPassword !== form.confirmPassword) {
      return setToast({ type: "error", text: "Passwords do not match!" });
    }
    try {
      setLoading(true);
      await api.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setToast({ type: "success", text: "Password Updated ✔️" });
      setForm({ ...form, currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordStrength(0);
    } catch {
      setToast({ type: "error", text: "Invalid current password!" });
    }
    setLoading(false);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFilePreview = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
    

      <main className="flex-1 md:ml-64 p-6 relative overflow-y-auto">
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 opacity-40 -z-10">
          <div className="absolute -top-20 left-0 w-72 h-72 bg-emerald-200/50 blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-lime-200/50 blur-[100px]" />
        </div>

        {/* Header */}
        <div className="bg-white/80 border border-white/40 shadow-lg p-6 rounded-3xl flex justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Doctor Profile</h1>
            <p className="text-xs text-gray-500">Manage your professional details</p>
          </div>
          <span className="text-[11px] text-gray-500 flex items-center gap-1">
            <CalendarDaysIcon className="h-4 w-4 text-emerald-600" />
            Joined {new Date(user?.createdAt).toLocaleDateString("en-US")}
          </span>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`mt-4 px-4 py-2 text-sm rounded-xl border animate-fade ${
              toast.type === "success"
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-red-100 text-red-700 border-red-200"
            }`}
          >
            {toast.text}
          </div>
        )}

        {/* Forms */}
        <div className="mt-6 grid md:grid-cols-3 gap-6">

          {/* Left */}
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="bg-white/80 border border-white/40 shadow p-5 rounded-3xl text-center flex flex-col items-center">
              <div className="relative">
                <img
                  src={preview || profileImage || "/placeholder.png"}
                  className="h-24 w-24 rounded-full border shadow object-cover"
                />
                <button
                  onClick={() => fileRef.current.click()}
                  className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1 rounded-full shadow"
                >
                  <CameraIcon className="h-4 w-4" />
                </button>
                <input type="file" ref={fileRef} hidden onChange={handleFilePreview} />
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white/80 border border-white/40 shadow p-5 rounded-3xl">
              <p className="text-xs text-gray-500 font-medium flex gap-2 items-center">
                <UserGroupIcon className="h-4 w-4 text-emerald-600" />
                Assigned Patients
              </p>
              <p className="text-3xl font-bold text-emerald-600 mt-3">{patientCount}</p>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6 md:col-span-2">
            {/* Doctor Info */}
            <div className="bg-white/80 border border-white/40 shadow p-6 rounded-3xl">
              <h2 className="text-sm font-semibold mb-4">Professional Info</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <TextInput icon={UserCircleIcon} label="Full Name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />

                <TextInput icon={AtSymbolIcon} label="Email" type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />

                <TextInput icon={PhoneIcon} label="Phone" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />

                <TextInput icon={BriefcaseIcon} label="Specialization"
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
              </div>

              <button
                className="mt-4 bg-emerald-600 text-white text-sm px-5 py-2 rounded-xl shadow hover:bg-emerald-700 transition"
                onClick={updateProfile}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {/* Security */}
            <div className="bg-white/80 border border-white/40 shadow p-6 rounded-3xl">
              <h2 className="text-sm font-semibold mb-4">Security Settings</h2>

              <TextInput
                icon={LockClosedIcon}
                label="Current Password"
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              />

              <TextInput
                icon={LockClosedIcon}
                label="New Password"
                type="password"
                value={form.newPassword}
                onChange={(e) => {
                  setForm({ ...form, newPassword: e.target.value });
                  setPasswordStrength(calcStrength(e.target.value));
                }}
              />

              {form.newPassword && <PasswordStrengthMeter strength={passwordStrength} />}

              <TextInput
                icon={LockClosedIcon}
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />

              <button
                className="mt-3 bg-gray-900 text-white text-sm px-5 py-2 rounded-xl shadow hover:bg-black transition"
                onClick={updatePassword}
              >
                Update Password
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
