import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CalendarCheck,
  BookOpenCheck,
  Users,
  HeartHandshake,
  Shield,
  Bell,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight,
  Award,
  Zap,
  Key,
  LogOut
} from 'lucide-react';
import { AppView, CurrentUser } from '../../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeAlertsCount: number;
  currentUser: CurrentUser;
  onOpenGamification: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  activeAlertsCount,
  currentUser,
  onOpenGamification,
  onLogout,
}) => {
  const navSections = [
    {
      title: 'Core Portals',
      items: [
        { id: 'landing' as AppView, label: 'Platform Home', icon: Home },
        { id: 'login' as AppView, label: 'Sign In / Login Gateway', icon: Key },
        { id: 'student_dashboard' as AppView, label: 'Student Dashboard', icon: LayoutDashboard, roleReq: 'student' },
        { id: 'faculty_dashboard' as AppView, label: 'Faculty Dashboard', icon: GraduationCap, roleReq: 'faculty' },
      ],
    },
    {
      title: 'AI & Intelligence',
      items: [
        { id: 'ai_assistant' as AppView, label: 'AI Learning Assistant', icon: Sparkles, badge: 'Gemini' },
        { id: 'performance_analytics' as AppView, label: 'Performance Analytics', icon: TrendingUp },
        {
          id: 'early_warning' as AppView,
          label: 'Early Warning Center',
          icon: AlertTriangle,
          badgeCount: activeAlertsCount,
          badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
        },
      ],
    },
    {
      title: 'Productivity & Peer',
      items: [
        { id: 'study_planner' as AppView, label: 'AI Study Planner', icon: CalendarCheck },
        { id: 'practice_tests' as AppView, label: 'Practice Tests Generator', icon: BookOpenCheck },
        { id: 'study_groups' as AppView, label: 'Peer Study Groups', icon: Users },
      ],
    },
    {
      title: 'Stakeholders & Admin',
      items: [
        { id: 'parent_portal' as AppView, label: 'Parent Portal', icon: HeartHandshake },
        { id: 'admin_dashboard' as AppView, label: 'Dean & Institutional Admin', icon: Shield },
        { id: 'notifications' as AppView, label: 'Notifications Center', icon: Bell },
        { id: 'profile_settings' as AppView, label: 'Privacy & Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`relative bg-[#090e1d] border-r border-slate-800/80 transition-all duration-300 flex flex-col shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3.5 top-6 z-30 w-7 h-7 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 shadow-lg transition-transform hover:scale-105"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Gamification / Streak Quick Banner (Student view) */}
      {!isCollapsed && (
        <div className="p-3 mx-3 mt-3 bg-gradient-to-r from-purple-950/40 to-brand-950/40 border border-purple-500/20 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-purple-500/20 text-amber-400">
                <Zap className="w-4 h-4 fill-amber-400" />
              </span>
              <div>
                <div className="text-xs font-bold text-slate-200">7-Day Study Streak</div>
                <div className="text-[10px] text-purple-300">1,450 XP Earned</div>
              </div>
            </div>
            <button
              onClick={onOpenGamification}
              className="text-[10px] font-semibold text-purple-300 hover:text-white px-2 py-1 rounded-lg bg-purple-900/40 border border-purple-700/50 hover:bg-purple-800/50 transition-colors"
            >
              Badges
            </button>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {!isCollapsed && (
              <h3 className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-600/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-400'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}

                      {!isCollapsed && item.badge && (
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple border border-accent-purple/30">
                          {item.badge}
                        </span>
                      )}

                      {!isCollapsed && typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                        >
                          {item.badgeCount}
                        </span>
                      )}

                      {/* Tooltip for collapsed mode */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-700">
                          {item.label}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070b16] space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          {!isCollapsed && (
            <div className="flex-1">
              <div className="text-[11px] font-semibold text-slate-300">15 / 15 Features Active</div>
              <div className="text-[9px] text-slate-400">All Modules Functional</div>
            </div>
          )}
        </div>

        {/* Quick Sign Out / Re-authenticate */}
        <button
          onClick={() => {
            if (onLogout) onLogout();
            else onNavigate('login');
          }}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 text-xs transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Sign Out / Switch Account"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          {!isCollapsed && <span className="text-[11px] font-medium truncate">Sign Out / Switch</span>}
        </button>
      </div>
    </aside>
  );
};
