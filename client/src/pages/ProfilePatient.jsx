import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../assets/api/api";
import Sidebar from "../components/Sidebar";
import defaultAvatar from "../assets/vector-users-icon.jpg";

import {
  UserCircleIcon,
  AtSymbolIcon,
  PhoneIcon,
  CameraIcon,
  LockClosedIcon,
  HeartIcon,
  MoonIcon,
  FireIcon,
  ScaleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

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
        className={`w-full rounded-xl border border-gray-300 bg-white/70 text-sm py-2 focus:ring-2 focus:ring-emerald-500 ${
          Icon ? "pl-10 pr-3" : "px-3"
        }`}
      />
    </div>
  </div>
);

const PasswordStrengthMeter = ({ strength }) => {
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-emerald-600"];
  return (
    <div className="flex gap-1 mt-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className={`h-1 flex-1 rounded-full ${i < strength ? colors[strength - 1] : "bg-gray-200"}`} />
      ))}
    </div>
  );
};

export default function ProfilePatient() {
  const { user, updateUser } = useContext(AuthContext);
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [healthSummary, setHealthSummary] = useState({});
  const [profileImage, setProfileImage] = useState("");
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setProfileImage(user.profileImage);
  }, [user]);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get("/logs/patient/me");
        const latest = res.data?.[0] || {};
        setHealthSummary({
          bp: latest.bloodPressure || "--/--",
          sugar: latest.bloodSugar ? `${latest.bloodSugar} mg/dL` : "N/A",
          sleep: latest.sleepHours ? `${latest.sleepHours} hrs` : "N/A",
          activity: latest.exerciseMinutes ? `${latest.exerciseMinutes} min` : "N/A",
        });
      } finally {
        setHealthLoading(false);
      }
    };
    fetchHealth();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleProfileUpdate = async () => {
  try {
    setLoading(true);
    
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("phone", form.phone);

    if (fileRef.current?.files[0]) {
      fd.append("profileImage", fileRef.current?.files[0]);
    }

    const res = await api.put("/auth/profile", fd);

    updateUser(res.data.user);
    setToast({ type: "success", text: "Profile updated successfully!" });

  } catch (err) {
    console.error(err);
    setToast({ type: "error", text: "Update failed!" });
  }
  setLoading(false);
  setTimeout(() => setToast(null), 3000);
};


  const calcStrength = (pwd) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  const handlePasswordChange = async () => {
    if (form.newPassword !== form.confirmPassword) {
      return setToast({ type: "error", text: "Passwords do not match!" });
    }
    try {
      setLoading(true);
      await api.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setToast({ type: "success", text: "Password updated!" });
      setForm({ ...form, currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordStrength(0);
    } catch {
      setToast({ type: "error", text: "Invalid current password!" });
    }
    setLoading(false);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      
      <main className="flex-1 md:ml-64 p-6 relative overflow-y-auto">
        
        <div className="pointer-events-none absolute inset-0 opacity-40 -z-10">
          <div className="absolute -top-20 left-0 w-72 h-72 bg-emerald-200/40 blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-lime-200/40 blur-[100px]" />
        </div>

        <div className="bg-white/80 p-6 rounded-3xl shadow-lg border border-white/40 flex justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
            <p className="text-xs text-gray-500">Manage your account settings</p>
          </div>
          <p className="text-[11px] text-gray-500 flex items-center gap-1">
            <CalendarDaysIcon className="h-4 w-4 text-emerald-600" />
            Joined {new Date(user?.createdAt).toLocaleDateString("en-US")}
          </p>
        </div>

        {toast && (
          <div
            className={`mt-4 px-4 py-2 text-sm rounded-xl shadow border ${
              toast.type === "success"
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-red-100 text-red-700 border-red-200"
            }`}
          >
            {toast.text}
          </div>
        )}

        <div className="mt-6 grid md:grid-cols-3 gap-6">

          <div className="space-y-6">
            <div className="bg-white/80 p-6 rounded-3xl shadow border border-white/40 text-center">
              <div className="relative mx-auto">
                <img
                src={preview || profileImage || defaultAvatar}
                className="h-24 w-24 rounded-full object-cover border shadow"
                />

                <button
                  onClick={() => fileRef.current.click()}
                  className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1 rounded-full"
                >
                  <CameraIcon className="h-4 w-4" />
                </button>
                <input ref={fileRef} type="file" hidden onChange={handleFile} />
              </div>

              <p className="mt-2 text-sm font-semibold">{form.name}</p>
              <p className="text-xs text-gray-600">{form.email}</p>
            </div>

            <div className="bg-white/80 p-6 rounded-3xl shadow border border-white/40">
              <h2 className="text-sm font-semibold mb-3">Health Summary</h2>

              {healthLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { icon: HeartIcon, label: "BP", val: healthSummary.bp },
                    { icon: ScaleIcon, label: "Sugar", val: healthSummary.sugar },
                    { icon: MoonIcon, label: "Sleep", val: healthSummary.sleep },
                    { icon: FireIcon, label: "Activity", val: healthSummary.activity },
                  ].map((i, x) => (
                    <div key={x} className="bg-white/60 rounded-xl px-3 py-2 flex gap-2 items-center border border-white/30">
                      <i.icon className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-[10px] text-gray-500">{i.label}</p>
                        <p className="font-medium">{i.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 md:col-span-2">
            <div className="bg-white/80 p-6 rounded-3xl shadow border border-white/40">
              <h2 className="text-sm font-semibold mb-4">Personal Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <TextInput  label="Full Name" name="name" value={form.name} onChange={handleChange} />
                <TextInput  label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
                <TextInput  label="Phone" name="phone" value={form.phone} onChange={handleChange} />
              </div>

              <button
                className="mt-4 bg-emerald-600 text-white text-sm px-5 py-2 rounded-xl shadow hover:bg-emerald-700"
                onClick={handleProfileUpdate}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>

            <div className="bg-white/80 p-6 rounded-3xl shadow border border-white/40">
              <h2 className="text-sm font-semibold mb-4">Change Password</h2>

              <TextInput icon={LockClosedIcon} label="Current Password" name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} />
              <TextInput icon={LockClosedIcon} label="New Password" name="newPassword" type="password" value={form.newPassword}
                onChange={(e) => {
                  handleChange(e);
                  setPasswordStrength(calcStrength(e.target.value));
                }} />

              {form.newPassword && <PasswordStrengthMeter strength={passwordStrength} />}

              <TextInput icon={LockClosedIcon} label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} />

              <button
                className="mt-3 bg-gray-900 text-white text-sm px-5 py-2 rounded-xl shadow hover:bg-black"
                onClick={handlePasswordChange}
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
