import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  Sparkles,
  Check,
  RefreshCw,
  Plus,
  Calendar as CalendarIcon,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sliders,
  RotateCcw
} from 'lucide-react';
import { StudyTask, AppView } from '../../types';
import { api } from '../../services/api';

interface StudyPlannerViewProps {
  onNavigate: (view: AppView) => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({ onNavigate }) => {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [generating, setGenerating] = useState(false);
  const [rebalancing, setRebalancing] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Generator modal / panel state
  const [targetHours, setTargetHours] = useState('3');
  const [preferredSlot, setPreferredSlot] = useState<'evening' | 'morning'>('evening');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getStudyTasks('s_alex_101');
      setTasks(res.tasks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await api.toggleTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setNotificationMsg(null);
    try {
      const res = await api.generateStudyPlan({
        targetHoursPerDay: Number(targetHours),
        weakSubjects: ['Computer Networks', 'Database Systems'],
        upcomingExams: ['Networks Lab Assessment', 'DBMS Midterm'],
        preferredTimeOfDay: preferredSlot
      });
      if (res.tasks) {
        setTasks(res.tasks);
        setNotificationMsg('Generated customized study blocks prioritizing your weak topics!');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleReschedule = async () => {
    setRebalancing(true);
    setNotificationMsg(null);
    try {
      const res = await api.rescheduleMissedTasks('s_alex_101');
      if (res.tasks) {
        setTasks(res.tasks);
        setNotificationMsg(res.message);
      }
    } finally {
      setRebalancing(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedPriority === 'all') return true;
    return t.priority.toLowerCase() === selectedPriority.toLowerCase();
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-accent-purple">
              <CalendarCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white">AI Adaptive Study Planner & Timetable</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
              Feature 8
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Personalized daily & weekly schedules prioritizing high-yield exam topics without burnout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReschedule}
            disabled={rebalancing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500 text-xs text-slate-200 font-semibold transition-all"
            title="Automatically rebalance missed sessions"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-purple-400 ${rebalancing ? 'animate-spin' : ''}`} />
            <span>Smart Rebalance</span>
          </button>

          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'calendar' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-purple-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 2. PROGRESS BANNER & GENERATOR CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Controls */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white">Generate Timetable</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Daily Study Time</label>
              <select
                value={targetHours}
                onChange={(e) => setTargetHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
              >
                <option value="2">2 Hours / Day (Light Review)</option>
                <option value="3">3 Hours / Day (Balanced - Recommended)</option>
                <option value="4">4 Hours / Day (Pre-Exam Sprint)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Preferred Time of Day</label>
              <select
                value={preferredSlot}
                onChange={(e) => setPreferredSlot(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
              >
                <option value="evening">Evening (04:00 PM - 09:00 PM)</option>
                <option value="morning">Morning (08:00 AM - 12:00 PM)</option>
              </select>
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-brand-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Synthesizing Schedule...' : 'Regenerate with AI'}</span>
            </button>
          </div>
        </div>

        {/* Progress & Priority Filter (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Session Completion Progress</h3>
                <p className="text-xs text-slate-400">
                  {completedCount} of {tasks.length} study tasks marked complete
                </p>
              </div>
              <span className="text-2xl font-black text-white">{progressPercent}%</span>
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
              <div
                className="bg-gradient-to-r from-brand-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Priority filter pills */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400">Filter By Urgency:</span>
            <div className="flex items-center gap-2">
              {['all', 'high', 'medium', 'low'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPriority(p)}
                  className={`text-xs px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                    selectedPriority === p
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. TASKS STREAM / CALENDAR */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleToggleTask(task.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                task.completed
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                  : 'glass-card border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                    task.completed ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-700 bg-slate-800'
                  }`}
                >
                  {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                      {task.title}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {task.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Course: <strong className="text-slate-300">{task.subject}</strong> • {task.timeSlot} • Date: {task.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">{task.durationMinutes} mins</span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    task.priority === 'High'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : task.priority === 'Medium'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Calendar Grid View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['2026-10-13 (Today)', '2026-10-14 (Tomorrow)', '2026-10-15 (Upcoming)'].map((dayHeader, dIdx) => (
            <div key={dIdx} className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white">{dayHeader}</h4>
                <CalendarIcon className="w-4 h-4 text-brand-400" />
              </div>

              <div className="space-y-3">
                {tasks.slice(dIdx * 2, dIdx * 2 + 2).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggleTask(t.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      t.completed ? 'bg-slate-900/30 border-slate-800/50 opacity-60' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="font-semibold text-slate-200">{t.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{t.timeSlot}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
