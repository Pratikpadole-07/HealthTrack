import React, { useEffect, useState } from "react";
import { getNotifications, markAsRead } from "../assets/api/api";

const Notifications = () => {
  const [notes, setNotes] = useState([]);

  const loadData = async () => {
    const res = await getNotifications();
    setNotes(res.data);
  };

  const seen = async (id) => {
    await markAsRead(id);
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-emerald-50 py-10 px-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-emerald-600 mb-4">
          Notifications
        </h2>

        {notes.length === 0 ? (
          <p className="text-gray-500 text-center">No notifications</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((n) => (
              <li
                key={n._id}
                className={`p-3 rounded-xl border ${
                  n.isRead ? "bg-gray-100" : "bg-emerald-50"
                }`}
              >
                <p className="text-gray-800 text-sm">{n.message}</p>
                <p className="text-[10px] text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
                {!n.isRead && (
                  <button
                    onClick={() => seen(n._id)}
                    className="text-xs text-emerald-600 mt-1"
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
