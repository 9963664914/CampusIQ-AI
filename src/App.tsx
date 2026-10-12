import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/views/LandingPage';
import { LoginView } from './components/views/LoginView';
import { StudentDashboard } from './components/views/StudentDashboard';
import { FacultyDashboard } from './components/views/FacultyDashboard';
import { AILearningAssistant } from './components/views/AILearningAssistant';
import { PerformanceAnalytics } from './components/views/PerformanceAnalytics';
import { EarlyWarningCenter } from './components/views/EarlyWarningCenter';
import { StudyPlannerView } from './components/views/StudyPlannerView';
import { PracticeTestsView } from './components/views/PracticeTestsView';
import { StudyGroupsView } from './components/views/StudyGroupsView';
import { ParentPortalView } from './components/views/ParentPortalView';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import { NotificationsView } from './components/views/NotificationsView';
import { ProfileSettingsView } from './components/views/ProfileSettingsView';
import { GamificationModal } from './components/views/GamificationModal';
import { LoginModal } from './components/auth/LoginModal';
import { AppView, CurrentUser, Badge } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: 'u_student_1',
    name: 'Alex Rivera',
    email: 'alex.rivera@edu.university.edu',
    role: 'student',
    studentId: 's_alex_101',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    bio: 'Junior Year, CSE. Dean\'s Honor List candidate.',
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(2);
  const [activeAlertsCount, setActiveAlertsCount] = useState(2);
  const [selectedSemester, setSelectedSemester] = useState('Sem 5 (Fall 2026)');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGamification, setShowGamification] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const auth = await api.getCurrentUser();
      if (auth.user) {
        setCurrentUser(auth.user);
      }
      const notifs = await api.getNotifications();
      const unread = notifs.filter((n) => !n.read).length;
      setUnreadNotificationsCount(unread);

      const alerts = await api.getEarlyWarningAlerts();
      const active = alerts.filter((a) => a.status === 'active').length;
      setActiveAlertsCount(active);

      const gam = await api.getGamification('s_alex_101');
      if (gam.badges) {
        setBadges(gam.badges);
      }
    } catch (e) {
      console.warn('Backend loading, using local state:', e);
    }
  };

  const handleSwitchPersona = async (role: string) => {
    try {
      const res = await api.switchPersona(role);
      if (res.user) {
        setCurrentUser(res.user);
      }
    } catch (e) {
      console.error(e);
    }

    // Auto navigate to relevant landing view for persona
    if (role === 'student') setCurrentView('student_dashboard');
    else if (role === 'faculty') setCurrentView('faculty_dashboard');
    else if (role === 'counselor') setCurrentView('early_warning');
    else if (role === 'parent') setCurrentView('parent_portal');
    else if (role === 'admin') setCurrentView('admin_dashboard');
  };

  const handleLoginSuccess = async (role: string, customUser?: CurrentUser, targetView?: AppView) => {
    if (customUser) {
      setCurrentUser(customUser);
    } else {
      await handleSwitchPersona(role);
    }

    if (targetView) {
      setCurrentView(targetView);
    } else {
      if (role === 'student') setCurrentView('student_dashboard');
      else if (role === 'faculty') setCurrentView('faculty_dashboard');
      else if (role === 'counselor') setCurrentView('early_warning');
      else if (role === 'parent') setCurrentView('parent_portal');
      else if (role === 'admin') setCurrentView('admin_dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn('Logout:', e);
    }
    setCurrentView('login');
  };

  const handleRefreshUnread = async () => {
    try {
      const notifs = await api.getNotifications();
      setUnreadNotificationsCount(notifs.filter((n) => !n.read).length);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onSwitchPersona={handleSwitchPersona}
        currentView={currentView}
        onNavigate={setCurrentView}
        unreadNotificationsCount={unreadNotificationsCount}
        selectedSemester={selectedSemester}
        onSelectSemester={setSelectedSemester}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLogout={handleLogout}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeAlertsCount={activeAlertsCount}
          currentUser={currentUser}
          onOpenGamification={() => setShowGamification(true)}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {currentView === 'landing' && (
              <LandingPage
                onNavigate={setCurrentView}
                currentUser={currentUser}
                onSwitchPersona={handleSwitchPersona}
              />
            )}

            {currentView === 'login' && (
              <LoginView
                onLoginSuccess={handleLoginSuccess}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'student_dashboard' && (
              <StudentDashboard
                onNavigate={setCurrentView}
                onOpenGamification={() => setShowGamification(true)}
              />
            )}

            {currentView === 'faculty_dashboard' && (
              <FacultyDashboard onNavigate={setCurrentView} />
            )}

            {currentView === 'ai_assistant' && (
              <AILearningAssistant onNavigate={setCurrentView} />
            )}

            {currentView === 'performance_analytics' && (
              <PerformanceAnalytics onNavigate={setCurrentView} />
            )}

            {currentView === 'early_warning' && (
              <EarlyWarningCenter onNavigate={setCurrentView} />
            )}

            {currentView === 'study_planner' && (
              <StudyPlannerView onNavigate={setCurrentView} />
            )}

            {currentView === 'practice_tests' && (
              <PracticeTestsView
                onNavigate={setCurrentView}
                onOpenGamification={() => setShowGamification(true)}
              />
            )}

            {currentView === 'study_groups' && (
              <StudyGroupsView onNavigate={setCurrentView} />
            )}

            {currentView === 'parent_portal' && (
              <ParentPortalView onNavigate={setCurrentView} />
            )}

            {currentView === 'admin_dashboard' && (
              <AdminDashboardView onNavigate={setCurrentView} />
            )}

            {currentView === 'notifications' && (
              <NotificationsView
                onNavigate={setCurrentView}
                onRefreshUnread={handleRefreshUnread}
              />
            )}

            {currentView === 'profile_settings' && (
              <ProfileSettingsView
                currentUser={currentUser}
                onNavigate={setCurrentView}
              />
            )}
          </div>
        </main>
      </div>

      {/* Instant User Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Gamification Badges & Streak Celebration Modal */}
      <GamificationModal
        isOpen={showGamification}
        onClose={() => setShowGamification(false)}
        badges={badges}
      />
    </div>
  );
};

export default App;
