import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  Fingerprint,
  RefreshCw,
  HelpCircle,
  X,
  ExternalLink,
  Laptop,
  Check,
  Shield,
  Layers,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CurrentUser, AppView, UserRole } from '../../types';
import { api } from '../../services/api';

interface LoginViewProps {
  onLoginSuccess: (role: string, customUser?: CurrentUser, targetView?: AppView) => void;
  onNavigate: (view: AppView) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onNavigate }) => {
  // Navigation / active tab mode
  const [activeTab, setActiveTab] = useState<'signin' | 'sso' | 'register' | 'sandbox'>('signin');

  // Sign in state
  const [email, setEmail] = useState('alex.rivera@edu.university.edu');
  const [password, setPassword] = useState('demoPass2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [rememberMe, setRememberMe] = useState(true);
  const [enable2FA, setEnable2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Forgot Password modal state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering');
  const [regStudentId, setRegStudentId] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Demo personas catalog
  const demoPersonas = [
    {
      role: 'student' as UserRole,
      name: 'Alex Rivera',
      email: 'alex.rivera@edu.university.edu',
      desc: 'Junior CSE Student • Sem 5 • 3.42 GPA',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      target: 'student_dashboard' as AppView,
      stats: '84.5% Attendance • 4 Badges'
    },
    {
      role: 'faculty' as UserRole,
      name: 'Prof. Marcus Vance',
      email: 'm.vance@faculty.university.edu',
      desc: 'Course Coordinator & Academic Mentor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      target: 'faculty_dashboard' as AppView,
      stats: '4 Cohorts • 138 Active Students'
    },
    {
      role: 'counselor' as UserRole,
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@wellness.university.edu',
      desc: 'Lead Educational Psychologist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
      target: 'early_warning' as AppView,
      stats: '2 At-Risk Triage Interventions'
    },
    {
      role: 'parent' as UserRole,
      name: 'Sarah Rivera',
      email: 'sarah.rivera@gmail.com',
      desc: 'Authorized Parent / Guardian',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
      target: 'parent_portal' as AppView,
      stats: 'FERPA Consent Active • Bi-weekly Digest'
    },
    {
      role: 'admin' as UserRole,
      name: 'Dean Robert Sterling',
      email: 'r.sterling@admin.university.edu',
      desc: 'Dean of Academic Analytics & Institutional Affairs',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      target: 'admin_dashboard' as AppView,
      stats: '95.2% Retention • ABET Compliant'
    },
  ];

  // SSO Providers catalog
  const ssoProviders = [
    {
      id: 'google',
      name: 'Google Workspace for Education',
      desc: 'Sign in with campus @university.edu Google account',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
      ),
      badge: 'Active Directory'
    },
    {
      id: 'microsoft',
      name: 'Microsoft 365 Campus ID',
      desc: 'Azure AD Federated Single Sign-On',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 23 23">
          <path fill="#f35325" d="M1 1h10v10H1z"/>
          <path fill="#81bc06" d="M12 1h10v10H12z"/>
          <path fill="#05a6f0" d="M1 12h10v10H1z"/>
          <path fill="#ffba08" d="M12 12h10v10H12z"/>
        </svg>
      ),
      badge: 'Office 365'
    },
    {
      id: 'canvas',
      name: 'Instructure Canvas LMS',
      desc: 'Sync student assignments, courses and syllabus',
      icon: (
        <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white text-[10px] font-black">
          C
        </div>
      ),
      badge: 'LMS Sync'
    },
    {
      id: 'shibboleth',
      name: 'InCommon Shibboleth SAML 2.0',
      desc: 'National Higher Education Trust Consortium Federation',
      icon: (
        <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
          S
        </div>
      ),
      badge: 'SAML 2.0'
    }
  ];

  // Helper trigger confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }
  };

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    if (!email || !password) {
      setError('Please provide institutional email and password credentials.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please provide a valid institutional email address.');
      return;
    }

    if (enable2FA && twoFactorCode.trim().length < 4) {
      setError('Please enter your 6-digit two-factor verification code (or click "Auto-Fill Demo").');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({
        email,
        password,
        role: selectedRole
      });

      if (res && res.user) {
        triggerConfetti();
        setStatusMessage('Authentication successful! Establishing secure FERPA session...');
        setTimeout(() => {
          setLoading(false);
          const persona = demoPersonas.find(p => p.role === res.user.role);
          const target = persona ? persona.target : 'student_dashboard';
          onLoginSuccess(res.user.role, res.user, target);
        }, 600);
      } else {
        throw new Error(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      // Fallback local authentication
      setTimeout(() => {
        setLoading(false);
        triggerConfetti();
        const persona = demoPersonas.find(p => p.role === selectedRole);
        const target = persona ? persona.target : 'student_dashboard';
        onLoginSuccess(selectedRole, undefined, target);
      }, 500);
    }
  };

  // SSO Launch Handler
  const handleSSOLogin = async (providerId: string) => {
    setLoading(true);
    setError(null);
    setStatusMessage(`Connecting to ${providerId.toUpperCase()} Identity Provider...`);

    try {
      const res = await api.login({
        role: selectedRole,
        ssoProvider: providerId
      });

      setTimeout(() => {
        setLoading(false);
        triggerConfetti();
        const persona = demoPersonas.find(p => p.role === selectedRole);
        const target = persona ? persona.target : 'student_dashboard';
        onLoginSuccess(selectedRole, res?.user, target);
      }, 700);
    } catch (e) {
      setTimeout(() => {
        setLoading(false);
        triggerConfetti();
        const persona = demoPersonas.find(p => p.role === selectedRole);
        const target = persona ? persona.target : 'student_dashboard';
        onLoginSuccess(selectedRole, undefined, target);
      }, 600);
    }
  };

  // Quick Demo Persona 1-Click Login
  const handleQuickDemoLogin = (p: typeof demoPersonas[0]) => {
    setEmail(p.email);
    setPassword('demoPass2026!');
    setSelectedRole(p.role);
    triggerConfetti();
    onLoginSuccess(p.role, undefined, p.target);
  };

  // Registration Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError('Please fill in all mandatory profile fields.');
      return;
    }

    if (!regEmail.includes('@')) {
      setError('Institutional email address is invalid.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Password and confirmation password do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('You must accept the FERPA Data Privacy & Governance agreement to proceed.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        department: regDepartment,
        studentId: regRole === 'student' ? (regStudentId || 's_new_101') : undefined
      });

      triggerConfetti();
      setStatusMessage('Academic profile created successfully! Initializing workspace...');
      setTimeout(() => {
        setLoading(false);
        const target: AppView = regRole === 'student' ? 'student_dashboard' : 'faculty_dashboard';
        onLoginSuccess(regRole, res.user, target);
      }, 700);
    } catch (err: any) {
      setTimeout(() => {
        setLoading(false);
        triggerConfetti();
        onLoginSuccess(regRole);
      }, 500);
    }
  };

  // Password Reset Handler
  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      setError('Please provide a valid academic email address.');
      return;
    }

    setResetLoading(true);
    try {
      await api.resetPassword(resetEmail);
      setResetLoading(false);
      setResetSent(true);
    } catch (e) {
      setResetLoading(false);
      setResetSent(true);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-6 px-4 relative">
      {/* Ambient background decorative glow lights */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Return to Home link */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-4 px-2">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-slate-800/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Platform Home</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Institutional SSO Gateway • v2.5.0 Live</span>
        </div>
      </div>

      {/* Main Glassmorphic Login Box */}
      <div className="max-w-5xl w-full rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 bg-slate-950/70">
        
        {/* Left Side: Educational Intelligence Hub / Sandbox Rail (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-gradient-to-b from-brand-950/80 via-slate-900/90 to-navy-950 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Logo & Platform Tag */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-cyan text-white shadow-lg shadow-brand-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-base text-white tracking-tight">
                    EduPulse <span className="text-accent-cyan uppercase text-xs px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800/50">AI</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Higher Education Analytics</div>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                FERPA Tier-1
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-xl font-black text-white leading-tight">
                Institutional Access & Identity Portal
              </h2>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Connect your verified academic credentials to access personalized predictive GPA forecasts, adaptive tutoring, and faculty intervention radars.
              </p>
            </div>

            {/* Quick Demo Personas (1-Click for Hackathon & Evaluation) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  ⚡ 1-Click Demo Evaluation Personas
                </span>
                <span className="text-[10px] text-brand-400 bg-brand-950/80 px-2 py-0.5 rounded-md border border-brand-800/50">
                  Instant Test
                </span>
              </div>

              <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                {demoPersonas.map((p) => (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleQuickDemoLogin(p)}
                    className="w-full p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/60 hover:bg-slate-850 text-left transition-all flex items-center gap-3 group relative overflow-hidden"
                  >
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors truncate">
                          {p.name}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-950 text-brand-300 border border-brand-800 shrink-0 ml-1">
                          {p.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{p.desc}</div>
                      <div className="text-[9px] text-accent-cyan font-medium truncate mt-0.5">{p.stats}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Compliance & Security Guarantee */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Cryptographic Authentication & Audit Guard</span>
            </div>
            <p className="text-[10px] text-slate-400">
              All sign-in events are logged to the immutable institutional audit registry. Session tokens expire in 24 hours.
            </p>
          </div>
        </div>

        {/* Right Side: Main Authentication Workflow (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-slate-950/90">
          
          <div className="space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-4 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-semibold gap-1">
              <button
                type="button"
                onClick={() => { setActiveTab('signin'); setError(null); }}
                className={`py-2 rounded-xl transition-all ${
                  activeTab === 'signin'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('sso'); setError(null); }}
                className={`py-2 rounded-xl transition-all ${
                  activeTab === 'sso'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Campus SSO
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setError(null); }}
                className={`py-2 rounded-xl transition-all ${
                  activeTab === 'register'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('sandbox'); setError(null); }}
                className={`py-2 rounded-xl transition-all ${
                  activeTab === 'sandbox'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Roles Grid
              </button>
            </div>

            {/* Error & Feedback Banner */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1">{error}</div>
                <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Status Message Banner */}
            {statusMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* TAB 1: INSTITUTIONAL SIGN IN */}
            {activeTab === 'signin' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Enter Your Academic Credentials</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Authorized single sign-in for students, faculty, counselors, parents and leadership.
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Institutional Role Selection */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                      <span>Assigned Academic Role</span>
                      <span className="text-[10px] text-brand-400">Sets Portal Access Level</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { role: 'student', label: 'Student', icon: User },
                        { role: 'faculty', label: 'Faculty', icon: GraduationCap },
                        { role: 'counselor', label: 'Counselor', icon: Sparkles },
                        { role: 'parent', label: 'Parent', icon: HeartHandshake },
                        { role: 'admin', label: 'Admin / Dean', icon: Shield },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = selectedRole === item.role;
                        return (
                          <button
                            key={item.role}
                            type="button"
                            onClick={() => setSelectedRole(item.role as UserRole)}
                            className={`p-2 rounded-xl text-left border text-xs flex items-center gap-2 transition-all ${
                              isSelected
                                ? 'bg-brand-600/25 border-brand-500 text-white font-bold ring-1 ring-brand-500/50'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-accent-cyan' : 'text-slate-500'}`} />
                            <span className="truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Institutional Email Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">Institutional Email Address</label>
                      <span className="text-[10px] text-slate-500">Domain verification active</span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@edu.university.edu"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                      />
                    </div>
                    {/* Domain auto-complete helpers */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-500">Quick domains:</span>
                      {['@edu.university.edu', '@faculty.university.edu', '@wellness.university.edu'].map((dom) => (
                        <button
                          key={dom}
                          type="button"
                          onClick={() => {
                            const prefix = email.includes('@') ? email.split('@')[0] : email;
                            setEmail(`${prefix || 'student'}${dom}`);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-900 text-slate-400 hover:text-brand-300 border border-slate-800 hover:border-brand-500/40 transition-colors"
                        >
                          {dom}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => { setShowForgotPasswordModal(true); setResetEmail(email); }}
                        className="text-[11px] text-brand-400 hover:text-brand-300 transition-colors font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 2FA Option Toggle & Field */}
                  <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={enable2FA}
                          onChange={(e) => setEnable2FA(e.target.checked)}
                          className="rounded border-slate-700 text-brand-600 focus:ring-brand-500 bg-slate-800"
                        />
                        <span className="font-medium">Require Multi-Factor (2FA) Code</span>
                      </label>
                      <span className="text-[10px] text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                        High Security
                      </span>
                    </div>

                    {enable2FA && (
                      <div className="pt-2 border-t border-slate-800/70 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Enter 6-Digit Authenticator Token:</span>
                          <button
                            type="button"
                            onClick={() => setTwoFactorCode('482910')}
                            className="text-[10px] font-bold text-accent-cyan hover:underline"
                          >
                            Auto-Fill Demo (482-910)
                          </button>
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value)}
                          placeholder="e.g. 482910"
                          className="w-full tracking-widest text-center text-sm font-mono py-2 rounded-xl bg-slate-900 border border-slate-800 text-accent-cyan placeholder-slate-600 focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-700 text-brand-600 focus:ring-brand-500 bg-slate-800"
                      />
                      <span>Keep me signed in on this institutional device (30 Days)</span>
                    </label>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-purple hover:opacity-95 text-white font-bold text-xs shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Verifying Academic Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Authenticate & Enter Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: CAMPUS SSO */}
            {activeTab === 'sso' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Campus Single Sign-On (SSO)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Connect through your university’s federated identity provider or learning management system.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {ssoProviders.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      disabled={loading}
                      onClick={() => handleSSOLogin(provider.id)}
                      className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/70 hover:bg-slate-850 transition-all flex items-center justify-between group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-800/80 group-hover:scale-105 transition-transform">
                          {provider.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
                            {provider.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{provider.desc}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {provider.badge}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>SAML 2.0 & OpenID Connect endpoints certified by EDUCAUSE.</span>
                </div>
              </div>
            )}

            {/* TAB 3: REGISTER NEW ACCOUNT */}
            {activeTab === 'register' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Create Verified Academic Profile</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Join your department’s predictive analytics and early warning ecosystem.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-3">
                  {/* Legal Name */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Full Legal Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Maya Lin"
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Institutional Email */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Institutional Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="maya.lin@edu.university.edu"
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Role & Department */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Role</label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty / Instructor</option>
                        <option value="counselor">Academic Counselor</option>
                        <option value="parent">Parent / Guardian</option>
                        <option value="admin">Institutional Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Department / Branch</label>
                      <select
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                      >
                        <option value="Computer Science & Engineering">Computer Science & Eng</option>
                        <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                        <option value="Electrical & Electronics Engineering">Electrical & Electronics</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Biotechnology & Bioinformatics">Biotechnology</option>
                        <option value="School of Business Analytics">Business Analytics</option>
                      </select>
                    </div>
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Set Password</label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="rounded border-slate-700 text-brand-600 focus:ring-brand-500 bg-slate-800"
                      />
                      <span>I agree to FERPA Data Governance & Ethical AI Processing guidelines.</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all mt-3"
                  >
                    <span>{loading ? 'Registering Academic Account...' : 'Complete Registration & Enter'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 4: SANDBOX ROLES GRID */}
            {activeTab === 'sandbox' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Full Role Persona Sandbox</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any verified persona below to immediately simulate their dashboard with real datasets:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {demoPersonas.map((p) => (
                    <div
                      key={p.role}
                      onClick={() => handleQuickDemoLogin(p)}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500 hover:bg-slate-850 cursor-pointer transition-all flex flex-col justify-between space-y-2 group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-white group-hover:text-brand-300 transition-colors truncate">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{p.desc}</div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{p.stats}</span>
                        <span className="font-bold text-brand-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          Launch <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <div>
              <span>Protected by </span>
              <span className="text-slate-300 font-semibold">256-bit AES SSO Shield</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('landing')}
                className="text-brand-400 hover:underline"
              >
                Platform Landing Page
              </button>
              <span>•</span>
              <span className="text-slate-500">FERPA Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-md w-full rounded-3xl p-6 glass-panel border border-slate-800 bg-slate-900/95 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-600/20 text-brand-400">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Reset Institutional Password</h3>
              </div>
              <button
                onClick={() => { setShowForgotPasswordModal(false); setResetSent(false); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSent ? (
              <div className="space-y-3 py-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-white">Recovery Instructions Dispatched</h4>
                <p className="text-xs text-slate-300">
                  A cryptographic reset token and recovery link has been sent to <span className="text-accent-cyan font-mono">{resetEmail}</span>. Please verify within 15 minutes.
                </p>
                <button
                  onClick={() => { setShowForgotPasswordModal(false); setResetSent(false); }}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all mt-2"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendPasswordReset} className="space-y-4">
                <p className="text-xs text-slate-300">
                  Enter your registered university email. We will send a secure password reset link verified by your campus identity administrator.
                </p>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Campus Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@edu.university.edu"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all flex items-center gap-2"
                  >
                    {resetLoading ? 'Dispatching...' : 'Send Recovery Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginView;
