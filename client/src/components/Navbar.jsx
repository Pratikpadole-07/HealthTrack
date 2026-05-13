import React, { useState, useContext, Fragment, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu, Transition } from "@headlessui/react";
import { getUnreadCount } from "../assets/api/api";

import {
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  ClockIcon,
  BellIcon
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role; // "DOCTOR" or "PATIENT"

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user) loadUnread();
  }, [user]);

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
    if (!user) {
      navigate("/login");
    } else if (role === "DOCTOR") {
      navigate("/doctor-dashboard");
    } else {
      navigate("/patient-dashboard");
    }
  };

  const tabs = [
    {
      name: "Dashboard",
      href: role === "DOCTOR" ? "/doctor-dashboard" : "/patient-dashboard",
      icon: ChartBarIcon,
      show: ["PATIENT", "DOCTOR"],
    },
    {
      name: "Symptom Checker",
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
      name: "My Appointments",
      href: "/appointments",
      icon: ClockIcon,
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

  return (
    <nav className="backdrop-blur-xl bg-white/60 border-b border-emerald-200/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* LOGO */}
          <h1
            onClick={handleLogoClick}
            className="cursor-pointer text-xl font-bold flex gap-1"
          >
            <span className="text-emerald-600">Health</span>
            <span className="text-zinc-700">Track</span>
          </h1>

          {/* DESKTOP NAV */}
          {user && (
            <div className="hidden sm:flex items-center gap-2">
              {visibleTabs.map(({ name, href, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center px-3 py-2 rounded-xl text-sm transition
                    ${
                      isActive(href)
                        ? "bg-emerald-500 text-white"
                        : "text-zinc-700 hover:bg-emerald-50"
                    }`}
                >
                  <Icon className="h-5 w-5 mr-1" />
                  {name}
                </Link>
              ))}

              <Link to="/notifications" className="relative px-3 py-2">
                <BellIcon className="h-6 w-6" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 rounded-full">
                    {unread}
                  </span>
                )}
              </Link>
            </div>
          )}

          {/* PROFILE MENU */}
          {user && (
            <Menu as="div" className="hidden sm:block relative">
              <Menu.Button className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                {user.name?.charAt(0).toUpperCase()}
              </Menu.Button>

              <Transition as={Fragment}>
                <Menu.Items className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow border py-1">
                  <Menu.Item>
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-emerald-50">
                      Profile
                    </Link>
                  </Menu.Item>
                  <Menu.Item>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          )}

          {/* MOBILE MENU BUTTON */}
          {user && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 bg-emerald-500 text-white rounded-lg"
            >
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          )}
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && user && (
        <div className="sm:hidden bg-white border-t px-4 py-3 space-y-1">
          {visibleTabs.map(({ name, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3 py-2 rounded-xl text-sm hover:bg-emerald-50"
            >
              <Icon className="h-5 w-5 mr-2" />
              {name}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
