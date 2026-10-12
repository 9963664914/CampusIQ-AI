import React from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Users,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Award,
  Zap,
  Clock,
  Compass,
  Key
} from 'lucide-react';
import { AppView, CurrentUser } from '../../types';
import { UserLoginForm } from '../auth/UserLoginForm';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
  currentUser: CurrentUser;
  onSwitchPersona: (role: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  currentUser,
  onSwitchPersona,
}) => {
  const features = [
    {
      num: '01',
      title: 'AI Student Performance Prediction',
      desc: 'Multivariate ML regression forecasting future semester GPA using attendance, assignment cadence, and internal midterm scores.',
      icon: TrendingUp,
      badge: 'ML Heuristics',
      view: 'student_dashboard' as AppView,
    },
    {
      num: '02',
      title: 'Real-Time Early Warning System',
      desc: 'Proactive detection of students at risk of course failure. Instant triage pipeline with severity levels and resolution tracking.',
      icon: AlertTriangle,
      badge: 'Risk Mitigation',
      view: 'early_warning' as AppView,
    },
    {
      num: '03',
      title: 'Personalized AI Learning Assistant',
      desc: 'Automated knowledge gap diagnosis, curated remedial video resources, and adaptive revision materials.',
      icon: BrainCircuit,
      badge: 'Gemini AI',
      view: 'ai_assistant' as AppView,
    },
    {
      num: '04',
      title: 'Student Success Dashboard',
      desc: 'Unified student cockpit displaying current GPA, predicted trajectories, attendance metrics, and strengths breakdown.',
      icon: Sparkles,
      badge: 'Interactive Cockpit',
      view: 'student_dashboard' as AppView,
    },
    {
      num: '05',
      title: 'AI Student Counselor Chatbot',
      desc: 'Empathetic 24/7 academic coach for exam stress, schedule optimization, and campus psychologist escalation.',
      icon: BookOpen,
      badge: 'Conversational LLM',
      view: 'ai_assistant' as AppView,
    },
    {
      num: '06',
      title: 'LMS Engagement Telemetry',
      desc: 'Weekly activity radar analyzing submission consistency, lab involvement, and participation patterns without bias.',
      icon: Layers,
      badge: 'Behavioral Insights',
      view: 'performance_analytics' as AppView,
    },
    {
      num: '07',
      title: 'Smart Academic Goal Setting',
      desc: 'Milestone tracking with visual progress meters, target completion dates, and dynamic micro-goals.',
      icon: Award,
      badge: 'Goal Tracking',
      view: 'student_dashboard' as AppView,
    },
    {
      num: '08',
      title: 'Dynamic AI Study Planner',
      desc: 'Customizable daily timetable that prioritizes weak subject blocks and automatically reschedules missed study sessions.',
      icon: Calendar,
      badge: 'Smart Calendar',
      view: 'study_planner' as AppView,
    },
    {
      num: '09',
      title: 'Inclusive Gamification & Badges',
      desc: 'Reward consistent daily effort, study streaks, and turnaround improvements rather than just raw marks.',
      icon: Zap,
      badge: 'XP & Streaks',
      view: 'student_dashboard' as AppView,
    },
    {
      num: '10',
      title: 'Faculty Recommendation System',
      desc: 'Subject-wise cohort diagnostics identifying high-failure topics, remedial workshops, and intervention tracking.',
      icon: Compass,
      badge: 'Faculty Triage',
      view: 'faculty_dashboard' as AppView,
    },
    {
      num: '11',
      title: 'Multi-Semester Academic Trends',
      desc: 'Longitudinal charts comparing semester-over-semester GPA, attendance rates, and predictive growth trajectories.',
      icon: TrendingUp,
      badge: 'Longitudinal BI',
      view: 'performance_analytics' as AppView,
    },
    {
      num: '12',
      title: 'Peer Learning & Study Pods',
      desc: 'Collaborative peer groups for sharing course notes, algorithmic problem walkthroughs, and peer tutoring.',
      icon: Users,
      badge: 'Peer Collaboration',
      view: 'study_groups' as AppView,
    },
    {
      num: '13',
      title: 'AI Practice Test Generator',
      desc: 'Generates rigorous MCQs on demand with instant scoring, timer, and detailed pedagogical explanations of mistakes.',
      icon: BookOpen,
      badge: 'Self-Testing',
      view: 'practice_tests' as AppView,
    },
    {
      num: '14',
      title: 'Parent & Guardian Portal',
      desc: 'Authorized, FERPA-compliant visibility into student attendance, progress milestones, and counselor communication.',
      icon: Users,
      badge: 'Family Sync',
      view: 'parent_portal' as AppView,
    },
    {
      num: '15',
      title: 'Institutional Security & Privacy',
      desc: 'Role-based access control, cryptographic audit logging, FERPA data governance, and anonymized aggregate exports.',
      icon: ShieldCheck,
      badge: 'Data Governance',
      view: 'admin_dashboard' as AppView,
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 rounded-3xl bg-gradient-to-b from-navy-850/80 via-slate-900/60 to-transparent border border-slate-800/80 px-6 sm:px-12">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-accent-purple/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-accent-cyan/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Platform Headline & CTAs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-brand-300 shadow-inner">
              <Sparkles className="w-4 h-4 text-accent-cyan animate-spin" style={{ animationDuration: '6s' }} />
              <span className="font-semibold uppercase tracking-wider text-[11px]">Next-Gen Higher Education Analytics</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan"></span>
              <span className="text-slate-400">15 Operational Features</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.18]">
              Empowering Every Student with <br />
              <span className="text-gradient">Predictive AI & Actionable Insights</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              <span className="font-semibold text-white">Smarter Insights. Brighter Futures.</span> The institutional intelligence platform forecasting student GPA trajectories, enabling early academic triage, and providing personalized Gemini AI tutoring.
            </p>

            {/* Quick Navigation Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('student_dashboard')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-purple text-white font-semibold text-xs shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] transition-all"
              >
                <Sparkles className="w-4 h-4 text-accent-cyan" />
                <span>Explore Student Cockpit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('faculty_dashboard')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-medium text-xs transition-all"
              >
                <span>Faculty Triage</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('early_warning')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-950/40 border border-rose-800/40 hover:border-rose-600 text-rose-300 font-medium text-xs transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Early Warning Radar</span>
              </button>
            </div>

            {/* Persona 1-Click Launch Bar */}
            <div className="pt-5 border-t border-slate-800/80">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2.5 flex items-center justify-between">
                <span>⚡ 1-Click Demo Evaluation Profiles:</span>
                <button
                  onClick={() => onNavigate('login')}
                  className="text-[10px] text-accent-cyan hover:underline font-bold"
                >
                  Full Gateway Page →
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { role: 'student', name: 'Alex Rivera (Student)', target: 'student_dashboard' as AppView },
                  { role: 'faculty', name: 'Prof. Vance (Faculty)', target: 'faculty_dashboard' as AppView },
                  { role: 'counselor', name: 'Dr. Rostova (Counselor)', target: 'early_warning' as AppView },
                  { role: 'parent', name: 'Sarah Rivera (Parent)', target: 'parent_portal' as AppView },
                  { role: 'admin', name: 'Dean Sterling (Admin)', target: 'admin_dashboard' as AppView },
                ].map((p) => (
                  <button
                    key={p.role}
                    onClick={() => {
                      onSwitchPersona(p.role);
                      onNavigate(p.target);
                    }}
                    className={`text-[11px] px-3 py-1.5 rounded-xl border transition-all ${
                      currentUser.role === p.role
                        ? 'bg-brand-600 text-white border-brand-500 font-semibold shadow-md shadow-brand-500/20'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Embedded User Login Form (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-600/30 via-accent-purple/30 to-accent-cyan/30 blur-lg opacity-75 pointer-events-none -z-10 animate-pulse-slow" />
            <UserLoginForm
              onSuccess={(role, user, target) => {
                onSwitchPersona(role);
                onNavigate(target || 'student_dashboard');
              }}
            />
          </div>
        </div>

        {/* 2. REAL-TIME PLATFORM METRICS SHOWCASE */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
          <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">94.2%</div>
            <div className="text-xs text-slate-400 mt-1">Cohort Retention Rate</div>
            <div className="text-[10px] text-emerald-400 font-medium mt-1">↑ +6.4% from baseline</div>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-400">92%</div>
            <div className="text-xs text-slate-400 mt-1">Prediction Confidence</div>
            <div className="text-[10px] text-brand-300 font-medium mt-1">Multivariate regression</div>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-accent-purple">3.2 Weeks</div>
            <div className="text-xs text-slate-400 mt-1">Earlier Risk Detection</div>
            <div className="text-[10px] text-purple-300 font-medium mt-1">Before midterms</div>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-accent-cyan">1,420</div>
            <div className="text-xs text-slate-400 mt-1">Simulated Students</div>
            <div className="text-[10px] text-cyan-300 font-medium mt-1">Demo Cohort Data</div>
          </div>
        </div>
      </section>

      {/* 3. ALL 15 FEATURES DIRECTORY */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-accent-cyan mb-1">
              Complete Feature Suite
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              All 15 Core Modules Fully Functional
            </h2>
          </div>
          <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            Click any feature card to jump directly to the live view
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.num}
                onClick={() => onNavigate(feat.view)}
                className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-brand-500/50 hover:bg-slate-850/60 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-brand-400 transition-colors">
                      {feat.num}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {feat.badge}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 group-hover:bg-brand-500/20 group-hover:scale-110 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-white group-hover:text-brand-300 transition-colors">
                      {feat.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium text-brand-400 group-hover:text-brand-300">
                  <span>Open Interactive Module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. HOW IT WORKS WORKFLOW */}
      <section className="glass-panel p-8 rounded-3xl border border-slate-800/80 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-purple">
            Architectural Pipeline
          </span>
          <h2 className="text-2xl font-bold text-white">How EduPulse AI Drives Real Impact</h2>
          <p className="text-xs text-slate-400">
            From daily academic telemetry to human-in-the-loop remedial counseling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-sm font-semibold text-white">Telemetry Ingestion</h4>
            <p className="text-xs text-slate-400">
              Aggregates biometric attendance, LMS logins, assignment timeliness, and internal quiz grades.
            </p>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-accent-purple/20 text-accent-purple flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-sm font-semibold text-white">ML Predictive Engine</h4>
            <p className="text-xs text-slate-400">
              Heuristic regression calculates predicted semester GPA and triggers early warning flags weeks prior to finals.
            </p>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-accent-cyan/20 text-accent-cyan flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-sm font-semibold text-white">Generative LLM Guidance</h4>
            <p className="text-xs text-slate-400">
              Gemini AI produces personalized study timetables, practice quiz items, and explanations of conceptual errors.
            </p>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h4 className="text-sm font-semibold text-white">Faculty Interventions</h4>
            <p className="text-xs text-slate-400">
              Advisors schedule 1-on-1 clinics, peer tutor pairings, and track verifiable academic recovery outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* 5. TECH STACK & SYSTEM SPECS */}
      <section className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Enterprise Full-Stack Architecture</h4>
          <p className="text-xs text-slate-400">
            React 19 • TypeScript • Tailwind CSS • Recharts • Node.js Express • Google Gemini 1.5 • Vite 8
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            REST API: /api/*
          </span>
          <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            Backend Port: 5000
          </span>
        </div>
      </section>
    </div>
  );
};
