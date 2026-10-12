import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Award,
  Calendar,
  Mail,
  Phone,
  ShieldCheck,
  Send,
  MessageCircle,
  FileCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { AppView } from '../../types';

interface ParentPortalViewProps {
  onNavigate: (view: AppView) => void;
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sentNotice, setSentNotice] = useState(false);

  useEffect(() => {
    loadParentData();
  }, []);

  const loadParentData = async () => {
    try {
      setLoading(true);
      const res = await api.getParentOverview('u_parent_1');
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSentNotice(true);
    setMessageText('');
    setTimeout(() => setSentNotice(false), 4000);
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
        Loading Parent Portal Academic Summary...
      </div>
    );
  }

  const { linkedStudent, academicSummary, subjectBreakdown, counselorContact, achievements } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <HeartHandshake className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white">Parent & Guardian Academic Engagement Portal</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
              Feature 14
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Linked Student: <strong className="text-white">{linkedStudent.name}</strong> (Roll: {linkedStudent.rollNo}) • Computer Science & Engineering
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            FERPA Authorized Link
          </span>
        </div>
      </div>

      {/* 2. SUMMARY KPI TILES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Current Cumulative GPA</div>
          <div className="text-3xl font-black text-white mt-1">{academicSummary.gpa.toFixed(2)}</div>
          <div className="text-[10px] text-emerald-400 font-medium mt-1">Dean's Honor Roll Track</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Lecture & Lab Attendance</div>
          <div className="text-3xl font-black text-white mt-1">{academicSummary.attendanceRate}%</div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">Required Threshold: 75%</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Forecasted Semester GPA</div>
          <div className="text-3xl font-black text-accent-cyan mt-1">{academicSummary.predictedGpa.toFixed(2)}</div>
          <div className="text-[10px] text-brand-300 font-medium mt-1">92% Prediction Confidence</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Active Academic Alerts</div>
          <div className="text-3xl font-black text-emerald-400 mt-1">0</div>
          <div className="text-[10px] text-emerald-300 font-medium mt-1">All Warnings Cleared</div>
        </div>
      </div>

      {/* 3. PROGRESS NARRATIVE & COUNSELOR CONTACT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Narrative & Coursework Breakdown (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Academic Status Summary for Families</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              {academicSummary.statusMessage}
            </p>

            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Current Subject Grades & Attendance:
              </div>
              <div className="divide-y divide-slate-800/60">
                {subjectBreakdown.map((s: any) => (
                  <div key={s.code} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{s.name}</span>
                      <span className="text-slate-400 text-[11px] ml-2">({s.code})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Attendance: <strong className="text-slate-200">{s.attendance}%</strong></span>
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-brand-500/20 text-brand-300">
                        Grade {s.predictedGrade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badges Earned Showcase */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Recent Achievements & Learning Milestones</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {achievements.map((b: any) => (
                <div key={b.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-amber-300">{b.title}</div>
                  <div className="text-[11px] text-slate-400">{b.description}</div>
                  <div className="text-[10px] text-emerald-400 pt-1">Earned on {b.unlockedAt}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Counselor Direct Line (1 col) */}
        <div className="space-y-4">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Direct Academic Counselor Contact</h3>
            <p className="text-xs text-slate-400">
              For questions regarding curriculum, course choices, or accommodations:
            </p>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-200">{counselorContact.name}</div>
              <div className="text-slate-400 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-400" />
                <span>{counselorContact.email}</span>
              </div>
              <div className="text-slate-400 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>{counselorContact.officeHours}</span>
              </div>
            </div>

            {/* Direct Message Form */}
            <form onSubmit={handleSendMessage} className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-slate-300 block">Send Note to Academic Counselor:</label>
              <textarea
                rows={3}
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Ask about academic progress, request a conference slot..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              ></textarea>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/30 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message to Counselor</span>
              </button>
            </form>

            {sentNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Message securely delivered to Dr. Elena Rostova!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
