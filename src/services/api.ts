import {
  CurrentUser,
  StudentProfile,
  SubjectPerformance,
  EarlyWarningAlert,
  SmartGoal,
  StudyTask,
  Badge,
  StudyGroup,
  QuizQuestion,
  NotificationItem,
  AuditLog
} from '../types';

const API_BASE = '/api';

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Auth / Current User
  async getCurrentUser(): Promise<{ user: CurrentUser; availableRoles: any[] }> {
    const res = await fetch(`${API_BASE}/auth/current`);
    return res.json();
  },

  async switchPersona(role: string): Promise<{ success: boolean; user: CurrentUser }> {
    const res = await fetch(`${API_BASE}/auth/switch-persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  async login(credentials: { email?: string; password?: string; role?: string; ssoProvider?: string }): Promise<{ success: boolean; user: CurrentUser; token?: string; error?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  async register(userData: { name: string; email: string; password?: string; role: string; department?: string; studentId?: string; rollNo?: string }): Promise<{ success: boolean; user: CurrentUser; token?: string; error?: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  async logout(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST'
    });
    return res.json();
  },

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  // Student Profile & Dashboard
  async getStudentDashboard(id = 's_alex_101') {
    const res = await fetch(`${API_BASE}/student/${id}`);
    return res.json();
  },

  async runPrediction(id = 's_alex_101') {
    const res = await fetch(`${API_BASE}/student/predict/${id}`, {
      method: 'POST'
    });
    return res.json();
  },

  // Early Warning Center
  async getEarlyWarningAlerts(): Promise<EarlyWarningAlert[]> {
    const res = await fetch(`${API_BASE}/early-warning`);
    return res.json();
  },

  async updateAlertAction(id: string, action: { status?: string; facultyNotes?: string; assignedTo?: string }) {
    const res = await fetch(`${API_BASE}/early-warning/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action)
    });
    return res.json();
  },

  // AI Counselor
  async askCounselor(message: string, studentId = 's_alex_101') {
    const res = await fetch(`${API_BASE}/ai/counselor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, studentId })
    });
    return res.json();
  },

  // AI Study Planner
  async getStudyTasks(studentId = 's_alex_101'): Promise<{ tasks: StudyTask[] }> {
    const res = await fetch(`${API_BASE}/study-planner/${studentId}`);
    return res.json();
  },

  async generateStudyPlan(params: {
    targetHoursPerDay: number;
    weakSubjects: string[];
    upcomingExams: string[];
    preferredTimeOfDay: string;
  }) {
    const res = await fetch(`${API_BASE}/study-planner/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async toggleTask(taskId: string) {
    const res = await fetch(`${API_BASE}/study-planner/task/${taskId}/toggle`, {
      method: 'POST'
    });
    return res.json();
  },

  async rescheduleMissedTasks(studentId = 's_alex_101') {
    const res = await fetch(`${API_BASE}/study-planner/reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId })
    });
    return res.json();
  },

  // Smart Goals
  async getGoals(studentId = 's_alex_101'): Promise<SmartGoal[]> {
    const res = await fetch(`${API_BASE}/goals/${studentId}`);
    return res.json();
  },

  async createGoal(goal: Partial<SmartGoal>) {
    const res = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal)
    });
    return res.json();
  },

  async updateGoal(id: string, updates: any) {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // AI Practice Tests
  async generateQuiz(params: { subject: string; topic: string; difficulty: string; count: number }) {
    const res = await fetch(`${API_BASE}/ai/generate-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async explainAnswer(params: { question: string; chosenOption: string; correctOption: string; explanation: string }) {
    const res = await fetch(`${API_BASE}/ai/explain-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  // Gamification
  async getGamification(studentId = 's_alex_101') {
    const res = await fetch(`${API_BASE}/gamification/${studentId}`);
    return res.json();
  },

  // Faculty Overview & Interventions
  async getFacultyOverview() {
    const res = await fetch(`${API_BASE}/faculty/overview`);
    return res.json();
  },

  async recordIntervention(intervention: any) {
    const res = await fetch(`${API_BASE}/faculty/interventions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intervention)
    });
    return res.json();
  },

  // Academic Trends
  async getAnalyticsTrends() {
    const res = await fetch(`${API_BASE}/analytics/trends`);
    return res.json();
  },

  // Study Groups
  async getStudyGroups(): Promise<StudyGroup[]> {
    const res = await fetch(`${API_BASE}/study-groups`);
    return res.json();
  },

  async toggleGroupMembership(groupId: string) {
    const res = await fetch(`${API_BASE}/study-groups/${groupId}/join`, {
      method: 'POST'
    });
    return res.json();
  },

  async postGroupMessage(groupId: string, message: string, author?: string) {
    const res = await fetch(`${API_BASE}/study-groups/${groupId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, author })
    });
    return res.json();
  },

  async createStudyGroup(group: Partial<StudyGroup>) {
    const res = await fetch(`${API_BASE}/study-groups/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(group)
    });
    return res.json();
  },

  // Parent Portal
  async getParentOverview(parentId = 'u_parent_1') {
    const res = await fetch(`${API_BASE}/parent/overview/${parentId}`);
    return res.json();
  },

  // Admin Metrics & Audit Logs
  async getAdminMetrics() {
    const res = await fetch(`${API_BASE}/admin/metrics`);
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`);
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE}/notifications`);
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'POST'
    });
    return res.json();
  },

  // Privacy Settings
  async getPrivacySettings() {
    const res = await fetch(`${API_BASE}/settings/privacy`);
    return res.json();
  },

  async updatePrivacySettings(settings: any) {
    const res = await fetch(`${API_BASE}/settings/privacy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  }
};
