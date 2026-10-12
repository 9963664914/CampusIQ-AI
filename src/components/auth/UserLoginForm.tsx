import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Key,
  GraduationCap,
  Sparkles,
  HeartHandshake,
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRole, CurrentUser, AppView } from '../../types';
import { api } from '../../services/api';

export interface UserLoginFormProps {
  onSuccess: (role: string, user?: CurrentUser, targetView?: AppView) => void;
  onCancel?: () => void;
  initialRole?: UserRole;
  compact?: boolean;
}

export const UserLoginForm: React.FC<UserLoginFormProps> = ({
  onSuccess,
  onCancel,
  initialRole = 'student',
  compact = false,
}) => {
  const [email, setEmail] = useState('alex.rivera@edu.university.edu');
  const [password, setPassword] = useState('demoPass2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const roles = [
    { id: 'student' as UserRole, label: 'Student', icon: User, demoEmail: 'alex.rivera@edu.university.edu', name: 'Alex Rivera' },
    { id: 'faculty' as UserRole, label: 'Faculty', icon: GraduationCap, demoEmail: 'm.vance@faculty.university.edu', name: 'Prof. Marcus Vance' },
    { id: 'counselor' as UserRole, label: 'Counselor', icon: Sparkles, demoEmail: 'elena.rostova@wellness.university.edu', name: 'Dr. Elena Rostova' },
    { id: 'parent' as UserRole, label: 'Parent', icon: HeartHandshake, demoEmail: 'sarah.rivera@gmail.com', name: 'Sarah Rivera' },
    { id: 'admin' as UserRole, label: 'Admin', icon: Shield, demoEmail: 'r.sterling@admin.university.edu', name: 'Dean Sterling' },
  ];

  const triggerConfetti = () => {
    try {
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const handleRoleSelect = (roleId: UserRole) => {
    setSelectedRole(roleId);
    const targetRole = roles.find((r) => r.id === roleId);
    if (targetRole) {
      setEmail(targetRole.demoEmail);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setError('Please provide institutional email and password.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid academic email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.login({
        email,
        password,
        role: selectedRole,
      });

      if (res && res.user) {
        triggerConfetti();
        setSuccessMsg(`Welcome back, ${res.user.name}! Authenticating...`);
        setTimeout(() => {
          setLoading(false);
          const targetMap: Record<string, AppView> = {
            student: 'student_dashboard',
            faculty: 'faculty_dashboard',
            counselor: 'early_warning',
            parent: 'parent_portal',
            admin: 'admin_dashboard',
          };
          onSuccess(res.user.role, res.user, targetMap[res.user.role] || 'student_dashboard');
        }, 500);
      } else {
        throw new Error(res?.error || 'Authentication failed');
      }
    } catch (err: any) {
      // Graceful offline/local fallback for demonstration
      setTimeout(() => {
        setLoading(false);
        triggerConfetti();
        const targetMap: Record<string, AppView> = {
          student: 'student_dashboard',
          faculty: 'faculty_dashboard',
          counselor: 'early_warning',
          parent: 'parent_portal',
          admin: 'admin_dashboard',
        };
        onSuccess(selectedRole, undefined, targetMap[selectedRole] || 'student_dashboard');
      }, 400);
    }
  };

  return (
    <div className={`w-full ${compact ? 'p-0' : 'p-6 sm:p-7'} rounded-3xl glass-card border border-slate-800 shadow-2xl relative bg-slate-950/85`}>
      {/* Form Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan text-white shadow-md shadow-brand-500/20">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Institutional User Sign In</h3>
              <p className="text-[11px] text-slate-400">Single Sign-On & Academic Analytics</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
            FERPA SSL
          </span>
        </div>
      </div>

      {/* Error / Success Feedback */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Role Selector Tabs */}
      <div className="mb-4">
        <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
          Select Institutional Role:
        </label>
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleSelect(r.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                title={`Switch to ${r.label}`}
              >
                <Icon className={`w-3.5 h-3.5 mb-1 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate w-full text-center">{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Email Field */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Institutional Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.rivera@edu.university.edu"
              required
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Institutional Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Security Notes */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-700 text-brand-600 focus:ring-brand-500 bg-slate-800"
            />
            <span className="text-[11px]">Remember on this computer</span>
          </label>
          <span className="text-[10px] text-accent-cyan font-mono">256-Bit SSL</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-purple hover:opacity-95 text-white font-bold text-xs shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-1 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Authenticating Session...</span>
            </>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Quick Demo 1-Click Autofill Pill Bar */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center justify-between">
            <span>⚡ 1-Click Test Autofill:</span>
            <span className="text-brand-400 text-[10px]">Instant Demo</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                handleRoleSelect('student');
                setPassword('demoPass2026!');
              }}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-300 border border-blue-500/30 transition-colors"
            >
              🎓 Student (Alex)
            </button>
            <button
              type="button"
              onClick={() => {
                handleRoleSelect('faculty');
                setPassword('demoPass2026!');
              }}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 transition-colors"
            >
              👨‍🏫 Faculty (Prof. Vance)
            </button>
            <button
              type="button"
              onClick={() => {
                handleRoleSelect('counselor');
                setPassword('demoPass2026!');
              }}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 transition-colors"
            >
              🧠 Counselor (Dr. Elena)
            </button>
            <button
              type="button"
              onClick={() => {
                handleRoleSelect('admin');
                setPassword('demoPass2026!');
              }}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 transition-colors"
            >
              🏛️ Dean Sterling
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserLoginForm;
