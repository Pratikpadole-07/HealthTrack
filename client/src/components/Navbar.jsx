import React, { useState, useContext, Fragment, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { getUnreadCount } from "../assets/api/api";

import {
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  ClockIcon,
  BellIcon,
  HeartIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const role = (user?.role || "").toUpperCase();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user) loadUnread();
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loadUnread = async () => {
    try {
      const count = await getUnreadCount();
      setUnread(count);
    } catch {}
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLogoClick = () => {
    if (!user) navigate("/login");
    else if (role === "DOCTOR") navigate("/doctor-dashboard");
    else navigate("/patient-dashboard");
  };

  const tabs = [
    {
      name: "Dashboard",
      href: role === "DOCTOR" ? "/doctor-dashboard" : "/patient-dashboard",
      icon: ChartBarIcon,
      show: ["PATIENT", "DOCTOR"],
    },
    {
      name: "Symptoms",
      href: "/symptom-checker",
      icon: ClipboardDocumentListIcon,
      show: ["PATIENT"],
    },
    {
      name: "History",
      href: "/symptom-history",
      icon: ClockIcon,
      show: ["PATIENT"],
    },
    {
      name: "Appointments",
      href: "/appointments",
      icon: CalendarDaysIcon,
      show: ["PATIENT"],
    },
    {
      name: "Profile",
      href: "/profile",
      icon: UserCircleIcon,
      show: ["PATIENT", "DOCTOR"],
    },
  ];

  const visibleTabs = tabs.filter((t) => t.show.includes(role));
  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl shadow-lg shadow-cyan-500/5 border-b border-cyan-100"
          : "bg-white/60 backdrop-blur-lg border-b border-white/80"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
              <HeartIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-cyan-700">Health</span>
              <span className="text-slate-800">Track</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {visibleTabs.map(({ name, href, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(href)
                    ? "bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-md shadow-cyan-500/25"
                    : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/notifications"
              className="relative p-2.5 rounded-xl text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 transition"
            >
              <BellIcon className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-bold rounded-full px-1">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>

            <Menu as="div" className="hidden md:block relative">
              <Menu.Button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-cyan-50 border border-slate-200/80 transition">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-white text-sm font-bold flex items-center justify-center">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate hidden lg:block">
                  {user.name?.split(" ")[0]}
                </span>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 glass-card-strong py-1 overflow-hidden">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/profile"
                        className={`block px-4 py-2.5 text-sm ${active ? "bg-cyan-50 text-cyan-800" : "text-slate-700"}`}
                      >
                        Profile settings
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`w-full text-left px-4 py-2.5 text-sm text-red-600 ${active ? "bg-red-50" : ""}`}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 text-white"
            >
              {mobileMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-t border-cyan-100 bg-white/95 backdrop-blur-xl px-4 py-3 space-y-1"
        >
          {visibleTabs.map(({ name, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                isActive(href) ? "bg-cyan-600 text-white" : "text-slate-700 hover:bg-cyan-50"
              }`}
            >
              <Icon className="h-5 w-5" />
              {name}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            Sign out
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
