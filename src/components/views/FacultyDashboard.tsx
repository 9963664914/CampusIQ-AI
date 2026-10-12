import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  AlertTriangle,
  Users,
  TrendingUp,
  BookOpen,
  Plus,
  CheckCircle,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../../services/api';
import { AppView } from '../../types';

interface FacultyDashboardProps {
  onNavigate: (view: AppView) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInterventionModal, setShowInterventionModal] = useState(false);

  // Intervention form state
  const [studentName, setStudentName] = useState('Jordan Chen');
  const [interventionType, setInterventionType] = useState('Remedial Session');
  const [subject, setSubject] = useState('Database Systems');
  const [outcomeNotes, setOutcomeNotes] = useState('');

  useEffect(() => {
    loadFacultyData();
  }, []);

  const loadFacultyData = async () => {
    try {
      setLoading(true);
      const res = await api.getFacultyOverview();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.recordIntervention({
        studentName,
        interventionType,
        subject,
        outcomeNotes
      });
      if (res.intervention) {
        setData((prev: any) => ({
          ...prev,
          interventions: [res.intervention, ...prev.interventions]
        }));
        setShowInterventionModal(false);
        setOutcomeNotes('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
        Loading Faculty Intelligence Cockpit...
      </div>
    );
  }

  // Risk distribution pie data
  const riskPieData = [
    { name: 'Low Risk (Safe)', value: 36, color: '#10b981' },
    { name: 'Medium Risk (Monitor)', value: 7, color: '#f59e0b' },
    { name: 'High Risk (Intervene)', value: 3, color: '#f43f5e' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. FACULTY HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white">Faculty Success & Intervention Command</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              Feature 10
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prof. Marcus Vance • Department of Computer Science & Engineering • 46 Active Students
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('early_warning')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Open Early Warning Center ({data.metrics.activeRiskAlerts})</span>
          </button>

          <button
            onClick={() => setShowInterventionModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Remedial Action</span>
          </button>
        </div>
      </div>

      {/* 2. CLASS METRICS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Class Size</div>
          <div className="text-2xl font-black text-white mt-1">46 Students</div>
          <div className="text-[10px] text-brand-400 mt-0.5">CSE Sem 5 Section A</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Class Mean GPA</div>
          <div className="text-2xl font-black text-white mt-1">{data.metrics.classAverageGpa}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">↑ +0.12 vs last semester</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Cohort Attendance</div>
          <div className="text-2xl font-black text-white mt-1">{data.metrics.overallAttendanceRate}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Campus benchmark 80%</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center bg-rose-950/20 border-rose-900/40">
          <div className="text-xs text-rose-300 font-medium">Requiring Attention</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{data.metrics.activeRiskAlerts}</div>
          <div className="text-[10px] text-rose-300 mt-0.5">Immediate triage needed</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Interventions Logged</div>
          <div className="text-2xl font-black text-accent-purple mt-1">{data.interventions.length}</div>
          <div className="text-[10px] text-purple-300 mt-0.5">100% Outcome tracked</div>
        </div>
      </div>

      {/* 3. COHORT RISK DISTRIBUTION & COMMONLY MISUNDERSTOOD TOPICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Cohort Academic Risk Distribution</h3>
            <span className="text-xs text-slate-400">Class of 46</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs">
            {riskPieData.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }}></span>
                <span className="text-slate-300">{r.name}: <strong className="text-white">{r.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature 10: Commonly Misunderstood Topics */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-cyan" />
              <h3 className="text-base font-bold text-white">Commonly Misunderstood Concepts</h3>
            </div>
            <span className="text-xs text-accent-cyan font-semibold">AI Curated</span>
          </div>

          <p className="text-xs text-slate-400">
            Topics showing high quiz failure rates where supplemental remedial sessions will maximize cohort recovery:
          </p>

          <div className="space-y-3">
            {data.commonlyMisunderstoodTopics.map((topic: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{topic.topic}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {topic.failureRatePercent}% Exam Error Rate
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Subject: <strong className="text-slate-300">{topic.subject}</strong></span>
                  <span className="text-brand-300 font-medium">Recommended Action: {topic.recommendedRemedial}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. FACULTY INTERVENTIONS TRACKER */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recorded Remedial Actions & Interventions</h3>
            <p className="text-xs text-slate-400">Verifiable longitudinal outcomes and mentorship audit logs</p>
          </div>
          <button
            onClick={() => setShowInterventionModal(true)}
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
          >
            + Log New Mentorship Session
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3 pl-2">Student</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Outcome Notes & Follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.interventions.map((int: any) => (
                <tr key={int.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pl-2 font-bold text-white">{int.studentName}</td>
                  <td className="py-3 text-slate-300">{int.interventionType}</td>
                  <td className="py-3 text-slate-300">{int.subject}</td>
                  <td className="py-3 text-slate-400 font-mono text-[11px]">{int.date}</td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        int.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {int.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 max-w-xs truncate">{int.outcomeNotes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD INTERVENTION MODAL */}
      {showInterventionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1628] border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
                <span>Log Student Remedial Intervention</span>
              </h3>
              <button
                onClick={() => setShowInterventionModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordIntervention} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Student Name</label>
                <select
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                >
                  <option value="Jordan Chen">Jordan Chen (High Risk - DBMS)</option>
                  <option value="Priya Sharma">Priya Sharma (Medium Risk - Networks)</option>
                  <option value="Ethan Brooks">Ethan Brooks (High Risk - Linear Algebra)</option>
                  <option value="Alex Rivera">Alex Rivera (Low Risk - General)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Intervention Type</label>
                  <select
                    value={interventionType}
                    onChange={(e) => setInterventionType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="Remedial Session">Remedial Session</option>
                    <option value="1-on-1 Mentorship">1-on-1 Mentorship</option>
                    <option value="Peer Tutor Match">Peer Tutor Match</option>
                    <option value="Counselor Referral">Counselor Referral</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="Database Systems">Database Systems</option>
                    <option value="Computer Networks">Computer Networks</option>
                    <option value="Linear Algebra">Linear Algebra</option>
                    <option value="Data Structures">Data Structures</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Action Plan & Outcome Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Outline topics covered, makeup assignments agreed upon, or next milestone..."
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInterventionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30"
                >
                  Record Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
