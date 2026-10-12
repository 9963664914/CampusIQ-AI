import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';
import { NotificationItem, AppView } from '../../types';
import { api } from '../../services/api';

interface NotificationsViewProps {
  onNavigate: (view: AppView) => void;
  onRefreshUnread: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onNavigate,
  onRefreshUnread,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      onRefreshUnread();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
              <Bell className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white">Notifications & Alerts Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time coursework alerts, grade trajectory shifts, upcoming assessments, and achievements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'alert', 'achievement', 'assignment'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`text-xs px-3 py-1.5 rounded-xl capitalize font-semibold transition-all border ${
                filterType === t
                  ? 'bg-brand-600 text-white border-brand-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 2. NOTIFICATIONS STREAM */}
      <div className="space-y-3">
        {filteredNotifs.map((notif) => {
          const typeIcons = {
            alert: <AlertTriangle className="w-5 h-5 text-rose-400" />,
            achievement: <Award className="w-5 h-5 text-amber-400" />,
            assignment: <BookOpen className="w-5 h-5 text-brand-400" />,
            counselor: <CheckCircle2 className="w-5 h-5 text-purple-400" />,
            system: <Bell className="w-5 h-5 text-slate-400" />
          }[notif.type] || <Bell className="w-5 h-5 text-slate-400" />;

          return (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                notif.read
                  ? 'glass-card border-slate-800/80 opacity-75'
                  : 'bg-slate-900 border-brand-500/50 shadow-lg shadow-brand-500/5'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-slate-800/80 shrink-0 mt-0.5">{typeIcons}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                  <div className="text-[10px] text-slate-400 font-mono pt-1">{notif.timestamp}</div>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="text-xs text-brand-400 hover:text-brand-300 font-semibold shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
