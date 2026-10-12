import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  Filter,
  Search,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { EarlyWarningAlert, AppView } from '../../types';
import { api } from '../../services/api';

interface EarlyWarningCenterProps {
  onNavigate: (view: AppView) => void;
}

export const EarlyWarningCenter: React.FC<EarlyWarningCenterProps> = ({ onNavigate }) => {
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<EarlyWarningAlert | null>(null);
  const [facultyNotesInput, setFacultyNotesInput] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.getEarlyWarningAlerts();
      setAlerts(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: 'acknowledged' | 'in_progress' | 'resolved') => {
    if (!selectedAlert) return;
    setUpdating(true);
    try {
      const res = await api.updateAlertAction(selectedAlert.id, {
        status,
        facultyNotes: facultyNotesInput || selectedAlert.facultyNotes || `Status updated to ${status}`
      });
      if (res.alert) {
        setAlerts((prev) => prev.map((a) => (a.id === selectedAlert.id ? res.alert : a)));
        setSelectedAlert(res.alert);
      }
    } finally {
      setUpdating(false);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'all') return true;
    if (filterSeverity === 'resolved') return a.status === 'resolved';
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white">Early Warning Triage Center</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
              Feature 2
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Proactive risk detection algorithm scanning attendance drops, consecutive missed labs, and score variances.
          </p>
        </div>

        {/* Severity quick filters */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'critical', 'high', 'medium', 'resolved'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`text-xs px-3 py-1.5 rounded-xl capitalize font-semibold transition-all border ${
                filterSeverity === sev
                  ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-600/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* 2. ALERTS GRID & DETAIL MODAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing {filteredAlerts.length} Active System Alerts</span>
            <span>Sorted by Severity & Urgency</span>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const isSelected = selectedAlert?.id === alert.id;
              const severityStyles = {
                critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
                high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
                low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
              }[alert.severity] || 'bg-slate-800 text-slate-400';

              const statusBadge = {
                active: 'bg-rose-950 text-rose-400 border-rose-800',
                acknowledged: 'bg-amber-950 text-amber-400 border-amber-800',
                in_progress: 'bg-blue-950 text-blue-400 border-blue-800',
                resolved: 'bg-emerald-950 text-emerald-400 border-emerald-800',
              }[alert.status];

              return (
                <div
                  key={alert.id}
                  onClick={() => {
                    setSelectedAlert(alert);
                    setFacultyNotesInput(alert.facultyNotes || '');
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-slate-900 border-brand-500 shadow-xl shadow-brand-500/10'
                      : 'glass-card border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityStyles}`}>
                          {alert.severity} Severity
                        </span>
                        <span className="text-xs font-bold text-white">{alert.studentName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">({alert.studentRoll})</span>
                      </div>
                      <div className="text-xs font-semibold text-brand-300 mt-1">
                        Trigger: {alert.triggerType}
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusBadge}`}>
                      {alert.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>Assigned: <strong className="text-slate-300">{alert.assignedTo}</strong></span>
                    <span>Logged: {alert.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Alert Action Panel (1 col) */}
        <div className="space-y-4">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 sticky top-24 space-y-5">
            {selectedAlert ? (
              <>
                <div className="border-b border-slate-800 pb-3">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Alert Triage Inspection
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedAlert.studentName}</h3>
                  <div className="text-xs text-slate-400 font-mono">{selectedAlert.studentRoll} • {selectedAlert.department}</div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-slate-400">Recommended Remedial Next Step:</div>
                  <div className="p-3 rounded-xl bg-brand-950/40 border border-brand-500/20 text-brand-200">
                    {selectedAlert.recommendedAction}
                  </div>
                </div>

                {/* Faculty Notes & Action */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">Faculty Review Notes:</label>
                  <textarea
                    rows={3}
                    value={facultyNotesInput}
                    onChange={(e) => setFacultyNotesInput(e.target.value)}
                    placeholder="Enter counselor intervention notes, agreed makeup timetable, or phone conference status..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Update Resolution Status:
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleUpdateStatus('acknowledged')}
                      disabled={updating}
                      className="px-2 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('in_progress')}
                      disabled={updating}
                      className="px-2 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[11px] font-bold"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      disabled={updating}
                      className="px-2 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold"
                    >
                      Resolve
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-center">
                  <button
                    onClick={() => onNavigate('faculty_dashboard')}
                    className="text-xs text-brand-400 hover:underline font-semibold"
                  >
                    View All Faculty Interventions →
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-3">
                <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs">Select any alert from the triage stream to review details and record intervention status.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
