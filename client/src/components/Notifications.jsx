import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getNotifications, markAsRead } from "../assets/api/api";
import { BellIcon, CheckIcon } from "@heroicons/react/24/outline";

const Notifications = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await getNotifications();
      setNotes(res.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const seen = async (id) => {
    await markAsRead(id);
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  const unreadCount = notes.filter((n) => !n.isRead).length;

  return (
    <div className="page-mesh max-w-2xl mx-auto space-y-8 relative z-10 pb-12">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-strong p-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <BellIcon className="h-8 w-8 text-cyan-600" />
            Notifications
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
      </motion.header>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BellIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No notifications yet</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notes.map((n, i) => (
            <motion.li
              key={n._id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`glass-card p-5 ${!n.isRead ? "border-l-4 border-l-cyan-500 bg-cyan-50/30" : ""}`}
            >
              <p className="text-slate-800 text-sm leading-relaxed">{n.message}</p>
              <p className="text-[11px] text-slate-400 mt-2">
                {new Date(n.createdAt).toLocaleString()}
              </p>
              {!n.isRead && (
                <button
                  onClick={() => seen(n._id)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-900"
                >
                  <CheckIcon className="h-4 w-4" />
                  Mark as read
                </button>
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
