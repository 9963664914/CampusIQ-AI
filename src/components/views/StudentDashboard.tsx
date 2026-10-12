import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  CalendarCheck,
  AlertCircle,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Target,
  BarChart2,
  Brain,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { StudentProfile, SubjectPerformance, SmartGoal, StudyTask, AppView } from '../../types';
import { api } from '../../services/api';

interface StudentDashboardProps {
  onNavigate: (view: AppView) => void;
  onOpenGamification: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onOpenGamification,
}) => {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [subjects, setSubjects] = useState<SubjectPerformance[]>([]);
  const [goals, setGoals] = useState<SmartGoal[]>([]);
  const [recentTasks, setRecentTasks] = useState<StudyTask[]>([]);
  const [predicting, setPredicting] = useState(false);
  const [predictionData, setPredictionData] = useState<any>(null);

  // New Goal modal state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<'GPA' | 'Attendance' | 'Skill' | 'Subject Mastery'>('Subject Mastery');
  const [newGoalTarget, setNewGoalTarget] = useState('90');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentDashboard('s_alex_101');
      setStudent(data.student);
      setSubjects(data.subjects);
      setGoals(data.goals);
      setRecentTasks(data.recentTasks);

      // Baseline prediction
      const pred = await api.runPrediction('s_alex_101');
      setPredictionData(pred);
    } catch (e) {
      console.error('Failed to load student dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRerunPrediction = async () => {
    setPredicting(true);
    try {
      const pred = await api.runPrediction('s_alex_101');
      setPredictionData(pred);
      if (student) {
        setStudent({ ...student, predictedGpa: pred.predictedGpa, riskLevel: pred.riskLevel });
      }
    } finally {
      setTimeout(() => setPredicting(false), 500);
    }
  };

  const handleToggleGoalMilestone = async (goalId: string, mIdx: number, currentStatus: boolean) => {
    try {
      await api.updateGoal(goalId, { milestoneIndex: mIdx, milestoneStatus: !currentStatus });
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === goalId) {
            const updated = [...g.milestones];
            updated[mIdx].completed = !currentStatus;
            return { ...g, milestones: updated };
          }
          return g;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    try {
      const res = await api.createGoal({
        title: newGoalTitle,
        category: newGoalCategory,
        targetValue: Number(newGoalTarget),
        unit: newGoalCategory === 'Attendance' ? '%' : 'Score',
        deadline: '2026-12-15'
      });
      if (res.goal) {
        setGoals((prev) => [...prev, res.goal]);
        setNewGoalTitle('');
        setShowGoalModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await api.toggleTask(taskId);
      setRecentTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-brand-400 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading Student Academic Records...</p>
      </div>
    );
  }

  // Radar chart data for subject balance
  const subjectRadarData = subjects.map((s) => ({
    subject: s.code,
    internalMarks: (s.internalMarks / 50) * 100,
    attendance: s.attendance,
    assignment: s.assignmentScore
  }));

  // Attendance weekly timeline data
  const attendanceTrendData = [
    { week: 'W1', attendance: 88, classAverage: 82 },
    { week: 'W2', attendance: 85, classAverage: 81 },
    { week: 'W3', attendance: 82, classAverage: 80 },
    { week: 'W4', attendance: 80, classAverage: 79 },
    { week: 'W5', attendance: 86, classAverage: 83 },
    { week: 'W6', attendance: 89, classAverage: 84 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. WELCOME & STUDENT HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800/80">
        <div className="flex items-center gap-4">
          <img
            src={student.avatar}
            alt={student.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/40 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white">{student.name}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">
                {student.rollNo}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Semester {student.semester} • CSE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Academic Advisor: <span className="text-slate-200 font-medium">{student.counselorAssigned}</span> • Enrolled in 5 Core Courses
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('practice_tests')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>AI Practice Quiz</span>
          </button>
          <button
            onClick={() => onNavigate('ai_assistant')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600/30 border border-purple-500/40 hover:bg-purple-600/40 text-purple-200 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-purple" />
            <span>Ask AI Counselor</span>
          </button>
          <button
            onClick={onOpenGamification}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold transition-all"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>XP & Badges (1,450)</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Current GPA */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="text-slate-400 text-xs font-medium">Cumulative GPA</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white">{student.gpa.toFixed(2)}</span>
            <span className="text-xs text-slate-400">/ 4.0</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">Dean's Honor Target</div>
        </div>

        {/* Card 2: Attendance Rate */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="text-slate-400 text-xs font-medium">Overall Attendance</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white">{student.attendanceRate}%</span>
            <span className="text-[11px] text-slate-400">Min 75% req</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-brand-500 h-full rounded-full" style={{ width: `${student.attendanceRate}%` }}></div>
          </div>
        </div>

        {/* Card 3: Assignments */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="text-slate-400 text-xs font-medium">Assignments Done</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white">{student.assignmentCompletionRate}%</span>
            <span className="text-xs text-emerald-400 font-bold">On Time</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${student.assignmentCompletionRate}%` }}></div>
          </div>
        </div>

        {/* Card 4: Predicted GPA */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 bg-gradient-to-br from-brand-950/40 to-transparent">
          <div className="text-brand-300 text-xs font-medium flex items-center justify-between">
            <span>Predicted GPA</span>
            <Brain className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-accent-cyan">{student.predictedGpa.toFixed(2)}</span>
            <span className="text-[10px] text-brand-300 bg-brand-900/50 px-1.5 py-0.5 rounded">92% Conf</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">↑ +0.23 trajectory</div>
        </div>

        {/* Card 5: Risk Level */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="text-slate-400 text-xs font-medium">Risk Assessment</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-emerald-400">{student.riskLevel}</span>
            <span className="text-[11px] text-slate-400">Score {student.riskScore}/100</span>
          </div>
          <div className="text-[11px] text-emerald-300 font-medium mt-1">Safe Academic Track</div>
        </div>

        {/* Card 6: Active Goals */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="text-slate-400 text-xs font-medium">Active Goals</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white">{goals.length}</span>
            <span className="text-xs text-slate-400">Tracked</span>
          </div>
          <button
            onClick={() => setShowGoalModal(true)}
            className="text-[11px] text-brand-400 hover:text-brand-300 font-medium mt-1 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Goal
          </button>
        </div>
      </div>

      {/* 3. FEATURE 1: AI PERFORMANCE PREDICTION SHOWCASE CARD */}
      <div className="glass-panel p-6 rounded-3xl border border-brand-500/30 bg-gradient-to-r from-brand-950/30 via-slate-900/60 to-purple-950/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-600/20 text-brand-400 ring-1 ring-brand-500/40">
              <Brain className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">AI Performance Prediction Engine</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
                  Feature 1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multivariate ML regression model estimating end-of-semester outcomes from real-time coursework metrics.
              </p>
            </div>
          </div>

          <button
            onClick={handleRerunPrediction}
            disabled={predicting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-brand-500 text-xs text-slate-200 font-semibold transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${predicting ? 'animate-spin text-brand-400' : ''}`} />
            <span>{predicting ? 'Re-computing Model...' : 'Re-Run Prediction Model'}</span>
          </button>
        </div>

        {/* Prediction factors and estimate warning */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {predictionData?.factors?.map((f: any, idx: number) => (
            <div key={idx} className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">{f.factor}</span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  Weight: {f.weight}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Clear estimate disclaimer required by prompt */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-300 font-semibold">Important Methodology Notice: </strong>
            These predictions are algorithmic statistical estimates based on past assignments and attendance. They are diagnostic recommendations designed to guide proactive study habits, <span className="underline">not guaranteed or predetermined academic outcomes</span>.
          </div>
        </div>
      </div>

      {/* 4. CHARTS: SUBJECT BREAKDOWN & ATTENDANCE TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Subject-wise Internal Scores vs Attendance */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Coursework Performance Breakdown</h3>
              <p className="text-xs text-slate-400">Internal exam marks (out of 50) and attendance by subject</p>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">Fall 2026</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjects} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="code" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="attendance" name="Attendance %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="assignmentScore" name="Assignment Score %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Attendance Consistency Trend */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Weekly Attendance vs Cohort Average</h3>
              <p className="text-xs text-slate-400">Tracking personal weekly attendance against class mean</p>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800/40">
              Above Average
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="attendance" name="Your Attendance %" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="classAverage" name="Class Average %" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. SMART GOALS & AI STUDY PLANNER TASKS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature 7: Smart Goal Setting */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-cyan" />
              <h3 className="text-base font-bold text-white">Smart Academic Goals</h3>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="text-xs flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Set Goal
            </button>
          </div>

          <div className="space-y-4">
            {goals.map((goal) => {
              const progressPct = Math.min(
                100,
                Math.round(
                  goal.category === 'GPA'
                    ? ((goal.currentValue - 2.0) / (goal.targetValue - 2.0)) * 100
                    : (goal.currentValue / goal.targetValue) * 100
                )
              );

              return (
                <div key={goal.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{goal.title}</h4>
                      <p className="text-[10px] text-slate-400">Deadline: {goal.deadline}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-brand-300">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-500 to-accent-cyan h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>

                  {/* Milestones checklist */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-semibold uppercase text-slate-400">Milestone Checkpoints:</div>
                    {goal.milestones.map((m, mIdx) => (
                      <button
                        key={mIdx}
                        onClick={() => handleToggleGoalMilestone(goal.id, mIdx, m.completed)}
                        className="w-full flex items-center gap-2 text-left text-xs group"
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            m.completed ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-700 bg-slate-800 group-hover:border-slate-500'
                          }`}
                        >
                          {m.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={`text-[11px] ${m.completed ? 'line-through text-slate-400' : 'text-slate-300'}`}>
                          {m.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature 8 Preview: Scheduled Study Tasks */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-accent-purple" />
              <h3 className="text-base font-bold text-white">Today's AI Study Schedule</h3>
            </div>
            <button
              onClick={() => onNavigate('study_planner')}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              <span>Full Planner</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  task.completed
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                      task.completed ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-700 bg-slate-800'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                      {task.title}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {task.subject} • {task.timeSlot} ({task.durationMinutes}m)
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    task.priority === 'High'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>

          {/* Quick AI Study Plan Prompt CTA */}
          <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-between text-xs">
            <span className="text-purple-200">Missed a session? Automatically adjust schedule without burnout.</span>
            <button
              onClick={() => onNavigate('study_planner')}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px] shrink-0"
            >
              Rebalance
            </button>
          </div>
        </div>
      </div>

      {/* 6. SUBJECTS PERFORMANCE TABLE */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Current Enrolled Courses & Remedial Diagnostics</h3>
            <p className="text-xs text-slate-400">Course-level breakdown of attendance, tests, and areas requiring focus</p>
          </div>
          <button
            onClick={() => onNavigate('practice_tests')}
            className="text-xs text-accent-cyan hover:underline font-semibold"
          >
            Take Subject Practice Quiz →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3 pl-2">Subject</th>
                <th className="pb-3">Credits</th>
                <th className="pb-3">Attendance</th>
                <th className="pb-3">Internal (50)</th>
                <th className="pb-3">Assignment (100)</th>
                <th className="pb-3">Predicted Grade</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Identified Focus Topic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {subjects.map((s) => (
                <tr key={s.code} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pl-2 font-semibold text-white">
                    {s.code}: {s.name}
                  </td>
                  <td className="py-3 text-slate-300">{s.credits}</td>
                  <td className="py-3">
                    <span className={`font-semibold ${s.attendance < 75 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {s.attendance}%
                    </span>
                  </td>
                  <td className="py-3 text-slate-200 font-mono">{s.internalMarks}/50</td>
                  <td className="py-3 text-slate-200 font-mono">{s.assignmentScore}/100</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-brand-500/20 text-brand-300">
                      {s.predictedGrade}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        s.riskStatus === 'Safe'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {s.riskStatus}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">
                    {s.improvementAreas[0] || 'Core syllabus revision'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE GOAL MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1628] border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-accent-cyan" />
                <span>Create Smart Academic Goal</span>
              </h3>
              <button
                onClick={() => setShowGoalModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Goal Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master CIDR Subnetting or Score 95% in Networks"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={newGoalCategory}
                    onChange={(e) => setNewGoalCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="Subject Mastery">Subject Mastery</option>
                    <option value="GPA">GPA Target</option>
                    <option value="Attendance">Attendance Target</option>
                    <option value="Skill">Technical Skill</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Target Value</label>
                  <input
                    type="number"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/30"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
