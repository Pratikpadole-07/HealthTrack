import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [];

  if (user.role === "patient") {
    menuItems.push(
      { label: "Dashboard", href: "/patient-dashboard", icon: HomeIcon },
      { label: "Profile", href: "/profile", icon: UserCircleIcon },
      {
        label: "Symptom Checker",
        href: "/symptom-checker",
        icon: ClipboardDocumentListIcon,
      }
    );
  }

  if (user.role === "doctor") {
    menuItems.push(
      { label: "Doctor Dashboard", href: "/doctor-dashboard", icon: UserGroupIcon },
      { label: "Profile", href: "/profile", icon: UserCircleIcon },
    );
  }

  const SidebarNav = () => (
    <div className="flex flex-col w-64 h-full bg-white/30 backdrop-blur-2xl border-r border-emerald-200/40 shadow-lg rounded-r-3xl">
      
      {/* Branding */}
      <div className="px-6 py-6 border-b border-emerald-200/20 bg-white/40 backdrop-blur-md">
        <h1 className="text-2xl font-bold tracking-wide text-emerald-700">
          Health<span className="text-zinc-800">Track</span>
        </h1>
        <p className="text-xs text-zinc-600 mt-1">
          Hi, {user?.name?.split(" ")[0]}
        </p>
        <span className="text-[10px] uppercase px-2 py-0.5 rounded-full mt-1 inline-block bg-emerald-100 text-emerald-700">
          {user.role}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto text-[15px]">
        {menuItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive(href)
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-300/40"
                : "text-zinc-700 hover:bg-emerald-100 hover:text-emerald-700"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-emerald-200/30">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:text-white hover:bg-red-500/80 rounded-xl transition-all"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen z-40">
        <SidebarNav />
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-emerald-500 text-white shadow-lg hover:bg-emerald-600"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 transform bg-white/50 backdrop-blur-xl border-r border-emerald-200/30 rounded-r-3xl shadow-xl transition-transform duration-300 z-50 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button onClick={() => setMenuOpen(false)} className="text-zinc-700 hover:text-zinc-900">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <SidebarNav />
      </div>
    </>
  );
};

export default Sidebar;
