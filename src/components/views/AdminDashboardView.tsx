import React, { useState, useEffect } from 'react';
import {
  Shield,
  Building2,
  Lock,
  Download,
  AlertCircle,
  CheckCircle2,
  Users,
  TrendingUp,
  FileText,
  Search,
  Key
} from 'lucide-react';
import { AuditLog, AppView } from '../../types';
import { api } from '../../services/api';

interface AdminDashboardViewProps {
  onNavigate: (view: AppView) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLog, setSearchLog] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [mRes, lRes] = await Promise.all([api.getAdminMetrics(), api.getAuditLogs()]);
      setMetrics(mRes);
      setLogs(lRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `edupulse_audit_logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
        Loading Institutional Security & Governance Cockpit...
      </div>
    );
  }

  const filteredLogs = logs.filter(
    (l) =>
      l.userName.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.action.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.resource.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white">Institutional Analytics & Data Governance</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
              Feature 15
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dean Robert Sterling • Office of Academic Affairs • ABET & FERPA Compliance Monitor
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs text-slate-200 font-semibold shadow-md transition-all"
        >
          <Download className="w-4 h-4 text-brand-400" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      {/* 2. CAMPUS BENCHMARK KPIS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Total Student Body</div>
          <div className="text-3xl font-black text-white mt-1">{metrics.totalStudents}</div>
          <div className="text-[10px] text-brand-400 mt-1">Across 4 Engineering Depts</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Institutional Retention</div>
          <div className="text-3xl font-black text-emerald-400 mt-1">{metrics.institutionalRetentionRate}%</div>
          <div className="text-[10px] text-emerald-300 mt-1">Target: &gt; 92.0%</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">At-Risk Interventions Completed</div>
          <div className="text-3xl font-black text-accent-purple mt-1">{metrics.interventionsCompleted}</div>
          <div className="text-[10px] text-purple-300 mt-1">100% Mentorship Audit</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">FERPA Compliance</div>
          <div className="text-3xl font-black text-white mt-1">100%</div>
          <div className="text-[10px] text-emerald-400 mt-1">Certified Clean Audit</div>
        </div>
      </div>

      {/* 3. DEPARTMENT COMPARISON BENCHMARKS */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Departmental Performance & Risk Index</h3>
          <span className="text-xs text-slate-400">Institutional Benchmarks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3 pl-2">Department</th>
                <th className="pb-3">Enrolled</th>
                <th className="pb-3">Mean GPA</th>
                <th className="pb-3">Attendance Rate</th>
                <th className="pb-3">Cohort Risk Ratio</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {metrics.departmentPerformance.map((dept: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pl-2 font-bold text-white">{dept.name}</td>
                  <td className="py-3 text-slate-300">{dept.students} students</td>
                  <td className="py-3 text-slate-200 font-mono">{dept.avgGpa}</td>
                  <td className="py-3 text-slate-200">{dept.attendance}%</td>
                  <td className="py-3 font-semibold text-brand-300">{dept.riskRatio}</td>
                  <td className="py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Compliant
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. SECURITY & AUDIT LOGS STREAM */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">Cryptographic Security & Access Audit Log</h3>
            <p className="text-xs text-slate-400">Live immutable audit trail of queries and identity events</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              placeholder="Filter audit events..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3 pl-2">Timestamp</th>
                <th className="pb-3">User & Role</th>
                <th className="pb-3">Action</th>
                <th className="pb-3">Target Resource</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3">Security Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 pl-2 text-slate-400">{log.timestamp}</td>
                  <td className="py-2.5 font-bold text-slate-200">
                    {log.userName} ({log.role})
                  </td>
                  <td className="py-2.5 text-brand-300 font-semibold">{log.action}</td>
                  <td className="py-2.5 text-slate-300">{log.resource}</td>
                  <td className="py-2.5 text-slate-400">{log.ipAddress}</td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
