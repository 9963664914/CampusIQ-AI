import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  PieChart as PieIcon,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { api } from '../../services/api';
import { AppView } from '../../types';

interface PerformanceAnalyticsProps {
  onNavigate: (view: AppView) => void;
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'gpa' | 'attendance' | 'engagement'>('gpa');

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalyticsTrends();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
        Loading Multi-Semester Academic Trends...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-accent-cyan">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white">Longitudinal Performance & Academic Trend Intelligence</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              Features 6 & 11
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking GPA trajectories, LMS activity cadence, and statistical correlations across 5 completed and upcoming semesters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['gpa', 'attendance', 'engagement'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMetric(m)}
              className={`text-xs px-3 py-1.5 rounded-xl uppercase font-bold tracking-wider transition-all border ${
                selectedMetric === m
                  ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-600/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MULTI-SEMESTER COMPARISON CHART */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Multi-Semester Progression & Forecast</h3>
            <p className="text-xs text-slate-400">Comparing actual past semester results with predicted Sem 6 trajectory</p>
          </div>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
            Consistent Upward Trajectory
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.multiSemesterData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="attendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="semester" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 4.0]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="gpa" name="Semester GPA (out of 4.0)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#gpaGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. FEATURE 6: WEEKLY ENGAGEMENT RADAR & CORRELATION ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Engagement */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Student Engagement Telemetry</h3>
              <p className="text-xs text-slate-400">Weekly LMS study hours and assignment on-time submissions</p>
            </div>
            <span className="text-[10px] text-accent-purple bg-purple-950/60 px-2 py-1 rounded-lg border border-purple-800/40">
              Feature 6
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyEngagement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="assignments" name="Assignments (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lmsHours" name="LMS Study Hours" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Statistical Insights & Correlation Analysis */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-base font-bold text-white">Statistical Correlation Findings</h3>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-white">Trend Summary:</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {data.trendSummary.summaryText}
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Evidence-Based Recommendations:
            </div>
            {data.trendSummary.keyObservations.map((obs: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{obs}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-brand-950/40 border border-brand-500/20 text-xs text-brand-300 flex items-center justify-between">
            <span>Forecast: {data.trendSummary.predictedTrajectory}</span>
            <button
              onClick={() => onNavigate('study_planner')}
              className="text-xs text-white bg-brand-600 hover:bg-brand-500 px-3 py-1.5 rounded-xl font-semibold"
            >
              Optimize Timetable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
