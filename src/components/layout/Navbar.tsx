import React, { useState } from 'react';
import {
  Bell,
  Search,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Sparkles,
  Calendar,
  LogOut,
  ExternalLink,
  Layers
} from 'lucide-react';
import { CurrentUser, AppView } from '../../types';

interface NavbarProps {
  currentUser: CurrentUser;
  onSwitchPersona: (role: string) => void;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  unreadNotificationsCount: number;
  selectedSemester: string;
  onSelectSemester: (sem: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLogout?: () => void;
  onOpenLoginModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchPersona,
  currentView,
  onNavigate,
  unreadNotificationsCount,
  selectedSemester,
  onSelectSemester,
  searchQuery,
  onSearchChange,
  onLogout,
  onOpenLoginModal,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const personas = [
    { role: 'student', name: 'Alex Rivera', label: 'Student (Junior CSE)', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { role: 'faculty', name: 'Prof. Marcus Vance', label: 'Faculty (Course Head)', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { role: 'counselor', name: 'Dr. Elena Rostova', label: 'Counselor (Student Well-being)', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { role: 'parent', name: 'Sarah Rivera', label: 'Parent / Guardian', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { role: 'admin', name: 'Dean Robert Sterling', label: 'Dean / Administrator', badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#080d1a]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand & Tagline */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group transition-all"
            title="Return to Landing Page"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-accent-purple to-accent-cyan p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090e1f] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-cyan animate-pulse-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  EduPulse <span className="text-accent-cyan font-black text-sm uppercase px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Live AI Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Smarter Insights. Brighter Futures.
              </p>
            </div>
          </button>
        </div>

        {/* Center: Search & Global Semester Filter */}
        <div className="flex-1 max-w-xl mx-2 hidden lg:flex items-center gap-3">
          {/* Global Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search subjects, students, topics, or early warnings..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>

          {/* Global Semester Filter */}
          <div className="relative flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-brand-400" />
            <select
              value={selectedSemester}
              onChange={(e) => onSelectSemester(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-2"
            >
              <option value="Sem 5 (Fall 2026)" className="bg-slate-900 text-slate-200">Sem 5 (Current)</option>
              <option value="Sem 4 (Spring 2026)" className="bg-slate-900 text-slate-200">Sem 4 (Spring)</option>
              <option value="Sem 3 (Fall 2025)" className="bg-slate-900 text-slate-200">Sem 3 (Fall)</option>
              <option value="All Semesters" className="bg-slate-900 text-slate-200">All Semesters</option>
            </select>
          </div>
        </div>

        {/* Right: Login Button, Role Switcher, Notifications & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Dedicated Login / Portal Access Button */}
          <button
            onClick={() => {
              if (onOpenLoginModal) onOpenLoginModal();
              else onNavigate('login');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'login'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-brand-500/50'
            }`}
            title="Open Instant Login Form"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="hidden sm:inline">Portal Login</span>
          </button>

          {/* Quick Demo Persona Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowProfileMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-brand-500/30 hover:border-brand-400 text-xs text-slate-200 transition-all shadow-sm"
              title="Switch demo persona for hackathon test"
            >
              <span className="w-2 h-2 rounded-full bg-brand-400"></span>
              <span className="font-semibold text-brand-300 uppercase tracking-wider text-[10px]">Persona:</span>
              <span className="font-medium truncate max-w-[100px] sm:max-w-none">{currentUser.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0d1527] border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-800 text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
                  <span>Switch Role / Demo Persona</span>
                  <span className="text-[10px] text-brand-400 bg-brand-950 px-1.5 py-0.5 rounded">1-Click Test</span>
                </div>
                <div className="space-y-1 mt-1">
                  {personas.map((p) => (
                    <button
                      key={p.role}
                      onClick={() => {
                        onSwitchPersona(p.role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                        currentUser.role === p.role
                          ? 'bg-brand-600/20 text-white border border-brand-500/40 font-medium'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-100">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.label}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${p.badge}`}>
                        {p.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Center Icon */}
          <button
            onClick={() => onNavigate('notifications')}
            className="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            title="Notifications Center"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#080d1a]">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar / Menu with Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowRoleDropdown(false);
              }}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
              title="Profile & Session Menu"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-brand-500/30"
              />
              <span className="text-xs font-medium text-slate-300 hidden sm:block max-w-[90px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0d1527] border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 border-b border-slate-800 flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-brand-500/40"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                    <span className="inline-block mt-0.5 text-[9px] uppercase font-bold px-2 py-0.2 rounded bg-brand-950 text-brand-300 border border-brand-800">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 mt-1.5">
                  <button
                    onClick={() => {
                      onNavigate('profile_settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-slate-300 hover:text-white hover:bg-slate-850 transition-colors"
                  >
                    <UserCheck className="w-4 h-4 text-brand-400" />
                    <span>Profile & Privacy Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('login');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-slate-300 hover:text-white hover:bg-slate-850 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-accent-cyan" />
                    <span>Institutional Login Gateway</span>
                  </button>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onLogout) {
                          onLogout();
                        } else {
                          onNavigate('login');
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-rose-400 hover:bg-rose-950/40 transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sign Out / Switch Session</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
