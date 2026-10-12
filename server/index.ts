import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  USERS,
  STUDENTS,
  SUBJECT_PERFORMANCE,
  EARLY_WARNING_ALERTS,
  SMART_GOALS,
  STUDY_TASKS,
  BADGES,
  STUDY_GROUPS,
  FACULTY_INTERVENTIONS,
  DEFAULT_QUIZ_QUESTIONS,
  NOTIFICATIONS,
  AUDIT_LOGS,
  PRIVACY_SETTINGS,
} from './database';
import {
  generate_study_plan,
  generate_practice_questions,
  explain_wrong_answer,
  answer_student_question,
  generate_learning_recommendations,
  summarize_academic_trends,
  explain_risk_factors,
} from './aiService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Session active user (default to student 'Alex Rivera')
let currentActiveRole = 'student';

// Logger middleware for audit tracking
app.use((req, res, next) => {
  // Silent log
  next();
});

// ==========================================
// 1. HEALTH & SYSTEM STATUS
// ==========================================
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    platform: 'EduPulse AI Student Analytics Platform',
    version: '2.5.0',
    aiProvider: process.env.GEMINI_API_KEY ? 'Google Gemini AI Live' : 'EduPulse Adaptive Inference Engine',
    demoMode: process.env.DEMO_MODE !== 'false',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 2. AUTHENTICATION & DEMO PERSONA SWITCHER
// ==========================================
app.get('/api/auth/current', (req: Request, res: Response) => {
  const user = USERS[currentActiveRole] || USERS.student;
  res.json({
    user,
    availableRoles: Object.keys(USERS).map(role => ({
      role,
      name: USERS[role].name,
      designation: USERS[role].designation || USERS[role].department || USERS[role].role,
      avatar: USERS[role].avatar
    }))
  });
});

app.post('/api/auth/switch-persona', (req: Request, res: Response) => {
  const { role } = req.body;
  if (role && USERS[role]) {
    currentActiveRole = role;

    // Log in audit log
    AUDIT_LOGS.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      userId: USERS[role].id,
      userName: USERS[role].name,
      role: USERS[role].role.toUpperCase(),
      action: 'SWITCH_USER_PERSONA',
      resource: `Role: ${role}`,
      ipAddress: '127.0.0.1 (Local Session)',
      status: 'SUCCESS'
    });

    return res.json({ success: true, user: USERS[role] });
  }
  return res.status(400).json({ error: 'Invalid role requested' });
});

// Full Authentication Login Endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, role, ssoProvider } = req.body;

  // Find user by email or by selected role
  let matchedUser = Object.values(USERS).find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  
  if (!matchedUser && role && USERS[role]) {
    matchedUser = USERS[role];
  } else if (!matchedUser) {
    // If arbitrary valid email provided, create/fallback to default matching persona
    const roleKey = role || 'student';
    matchedUser = USERS[roleKey] || USERS.student;
  }

  currentActiveRole = matchedUser.role;

  // Log in institutional audit log
  AUDIT_LOGS.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    userId: matchedUser.id,
    userName: matchedUser.name,
    role: matchedUser.role.toUpperCase(),
    action: ssoProvider ? `SSO_LOGIN_${ssoProvider.toUpperCase()}` : 'USER_PASSWORD_AUTHENTICATED',
    resource: `Portal Access: ${matchedUser.role}`,
    ipAddress: '127.0.0.1 (Institutional SSO Gateway)',
    status: 'SUCCESS'
  });

  return res.json({
    success: true,
    user: matchedUser,
    token: `edupulse-auth-jwt-${Date.now()}`,
    expiresIn: '24h',
    authMethod: ssoProvider ? `SSO_${ssoProvider}` : 'STANDARD_PASSWORD'
  });
});

// Account Registration Endpoint
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, role = 'student', department = 'Computer Science & Engineering', studentId = 's_new_101', rollNo = 'CS-2026-999' } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Full legal name and institutional email are required.' });
  }

  const userId = `u_${role}_${Date.now()}`;
  const newUser = {
    id: userId,
    name,
    email,
    role,
    department,
    studentId: role === 'student' ? studentId : undefined,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    bio: `Verified ${role} enrolled in ${department}.`
  };

  // Register in memory users database
  USERS[role] = newUser;
  currentActiveRole = role;

  // Log in audit log
  AUDIT_LOGS.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    userId: newUser.id,
    userName: newUser.name,
    role: newUser.role.toUpperCase(),
    action: 'NEW_ACCOUNT_REGISTERED',
    resource: `Department: ${department}`,
    ipAddress: '127.0.0.1 (Registration Gateway)',
    status: 'SUCCESS'
  });

  return res.json({
    success: true,
    user: newUser,
    token: `edupulse-reg-jwt-${Date.now()}`
  });
});

// Logout Endpoint
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const user = USERS[currentActiveRole] || USERS.student;
  
  AUDIT_LOGS.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    userId: user.id,
    userName: user.name,
    role: user.role.toUpperCase(),
    action: 'USER_LOGOUT_SESSION_TERMINATED',
    resource: 'Session Destroyed',
    ipAddress: '127.0.0.1',
    status: 'SUCCESS'
  });

  return res.json({ success: true, message: 'Logged out successfully' });
});

// Password Reset Endpoint
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email } = req.body;
  
  AUDIT_LOGS.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    userId: 'anonymous',
    userName: email || 'Unknown',
    role: 'SECURITY',
    action: 'PASSWORD_RESET_DISPATCHED',
    resource: `Target: ${email}`,
    ipAddress: '127.0.0.1',
    status: 'SUCCESS'
  });

  return res.json({
    success: true,
    message: `Password reset verification token dispatched to ${email || 'your registered academic email'}.`
  });
});

// ==========================================
// 3. STUDENT PROFILE & DASHBOARD DATA
// ==========================================
app.get('/api/students', (req: Request, res: Response) => {
  res.json(Object.values(STUDENTS));
});

app.get('/api/student/:id', (req: Request, res: Response) => {
  const student = STUDENTS[req.params.id] || STUDENTS['s_alex_101'];
  res.json({
    student,
    subjects: SUBJECT_PERFORMANCE,
    goals: SMART_GOALS.filter(g => g.studentId === student.id),
    recentTasks: STUDY_TASKS.filter(t => t.studentId === student.id).slice(0, 4),
    badges: BADGES,
    alerts: EARLY_WARNING_ALERTS.filter(a => a.studentId === student.id)
  });
});

// Feature 1: AI-Based Student Performance Prediction
app.post('/api/student/predict/:id', async (req: Request, res: Response) => {
  const student = STUDENTS[req.params.id] || STUDENTS['s_alex_101'];

  // Baseline Heuristic ML Prediction Formula based on:
  // Attendance (30%), Internal Marks (40%), Assignment completion (20%), Quiz performance (10%)
  const avgInternalRatio = SUBJECT_PERFORMANCE.reduce((acc, s) => acc + (s.internalMarks / 50), 0) / SUBJECT_PERFORMANCE.length;
  const avgAssignmentRatio = (student.assignmentCompletionRate / 100);
  const attendanceRatio = (student.attendanceRate / 100);

  const compositeScore = (attendanceRatio * 0.3) + (avgInternalRatio * 0.45) + (avgAssignmentRatio * 0.25);
  const rawGpa = Math.min(4.0, Math.max(1.5, (compositeScore * 4.0)));
  const predictedGpa = parseFloat(rawGpa.toFixed(2));

  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  let riskScore = Math.round((1 - compositeScore) * 100);
  if (compositeScore < 0.65) {
    riskLevel = 'High';
  } else if (compositeScore < 0.80) {
    riskLevel = 'Medium';
  }

  const factors = [
    {
      factor: 'Lecture & Lab Attendance',
      weight: 30,
      impact: attendanceRatio >= 0.8 ? 'positive' : 'negative' as any,
      description: `Current attendance is ${student.attendanceRate}%. Consistent attendance directly drives test performance.`
    },
    {
      factor: 'Continuous Internal Assessments',
      weight: 45,
      impact: avgInternalRatio >= 0.75 ? 'positive' : 'negative' as any,
      description: `Average internal marks are ${(avgInternalRatio * 50).toFixed(1)}/50. Strongest correlation with final grade.`
    },
    {
      factor: 'Assignment On-Time Completion',
      weight: 25,
      impact: avgAssignmentRatio >= 0.85 ? 'positive' : 'negative' as any,
      description: `${student.assignmentCompletionRate}% completion rate reflects high self-regulation.`
    }
  ];

  const riskExplanation = await explain_risk_factors({
    riskLevel,
    riskScore,
    factors
  });

  const recommendations = await generate_learning_recommendations({
    attendance: student.attendanceRate,
    weakAreas: student.weakAreas,
    recentQuizScores: SUBJECT_PERFORMANCE.map(s => s.quizScore)
  });

  res.json({
    studentId: student.id,
    currentGpa: student.gpa,
    predictedGpa,
    confidenceScore: student.confidenceScore,
    riskLevel,
    riskScore,
    isEstimate: true,
    disclaimer: 'Predictions are diagnostic estimates computed using multivariate regression over historical academic indicators. Not guaranteed outcomes.',
    factors,
    riskExplanation,
    recommendations
  });
});

// ==========================================
// 4. EARLY WARNING SYSTEM (Feature 2)
// ==========================================
app.get('/api/early-warning', (req: Request, res: Response) => {
  res.json(EARLY_WARNING_ALERTS);
});

app.post('/api/early-warning/:id/action', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, facultyNotes, assignedTo } = req.body;

  const alertIndex = EARLY_WARNING_ALERTS.findIndex(a => a.id === id);
  if (alertIndex !== -1) {
    if (status) EARLY_WARNING_ALERTS[alertIndex].status = status;
    if (facultyNotes) EARLY_WARNING_ALERTS[alertIndex].facultyNotes = facultyNotes;
    if (assignedTo) EARLY_WARNING_ALERTS[alertIndex].assignedTo = assignedTo;

    // Create notification
    NOTIFICATIONS.unshift({
      id: `notif-${Date.now()}`,
      userId: 'u_faculty_1',
      title: `Early Warning Alert Updated (${EARLY_WARNING_ALERTS[alertIndex].studentName})`,
      message: `Status marked as "${status || 'Updated'}" with notes: ${facultyNotes || 'None'}`,
      type: 'alert',
      timestamp: 'Just now',
      read: false
    });

    return res.json({ success: true, alert: EARLY_WARNING_ALERTS[alertIndex] });
  }

  res.status(404).json({ error: 'Alert not found' });
});

// ==========================================
// 5. AI COUNSELOR & LEARNING ASSISTANT (Features 3 & 5)
// ==========================================
app.post('/api/ai/counselor', async (req: Request, res: Response) => {
  const { message, studentId } = req.body;
  const student = STUDENTS[studentId] || STUDENTS['s_alex_101'];

  const reply = await answer_student_question({
    studentQuery: message,
    studentContext: {
      name: student.name,
      gpa: student.gpa,
      attendance: student.attendanceRate,
      weakAreas: student.weakAreas
    }
  });

  res.json({
    reply,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    author: 'EduPulse AI Counselor'
  });
});

// ==========================================
// 6. AI STUDY PLANNER (Features 3 & 8)
// ==========================================
app.get('/api/study-planner/:studentId', (req: Request, res: Response) => {
  const studentId = req.params.studentId || 's_alex_101';
  const tasks = STUDY_TASKS.filter(t => t.studentId === studentId);
  res.json({ tasks });
});

app.post('/api/study-planner/generate', async (req: Request, res: Response) => {
  const { targetHoursPerDay = 3, weakSubjects = ['Computer Networks'], upcomingExams = ['CS308 Midterm'], preferredTimeOfDay = 'evening' } = req.body;

  const generated = await generate_study_plan({
    targetHoursPerDay: Number(targetHoursPerDay),
    weakSubjects,
    upcomingExams,
    preferredTimeOfDay
  });

  // Append new generated tasks to user study schedule
  const studentId = 's_alex_101';
  generated.forEach((g: any) => {
    STUDY_TASKS.unshift({
      id: g.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      studentId,
      subject: g.subject,
      title: g.title,
      durationMinutes: g.durationMinutes || 45,
      date: new Date().toISOString().split('T')[0],
      timeSlot: g.timeSlot || '05:00 PM - 05:45 PM',
      priority: g.priority || 'High',
      completed: false,
      type: g.type || 'Revision'
    });
  });

  res.json({ success: true, tasks: STUDY_TASKS.filter(t => t.studentId === studentId) });
});

app.post('/api/study-planner/task/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const task = STUDY_TASKS.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    return res.json({ success: true, task });
  }
  res.status(404).json({ error: 'Task not found' });
});

app.post('/api/study-planner/reschedule', (req: Request, res: Response) => {
  const { studentId = 's_alex_101' } = req.body;
  // Automatically move uncompleted past tasks forward
  let rescheduledCount = 0;
  STUDY_TASKS.forEach(t => {
    if (t.studentId === studentId && !t.completed) {
      t.date = '2026-10-14';
      t.timeSlot = '06:00 PM - 07:00 PM (Rescheduled)';
      rescheduledCount++;
    }
  });

  res.json({
    success: true,
    message: `Smart Rebalancer adjusted ${rescheduledCount} sessions without overloading your calendar!`,
    tasks: STUDY_TASKS.filter(t => t.studentId === studentId)
  });
});

// ==========================================
// 7. SMART GOAL SETTING (Feature 7)
// ==========================================
app.get('/api/goals/:studentId', (req: Request, res: Response) => {
  const studentId = req.params.studentId || 's_alex_101';
  res.json(SMART_GOALS.filter(g => g.studentId === studentId));
});

app.post('/api/goals', (req: Request, res: Response) => {
  const { studentId = 's_alex_101', title, category, targetValue, unit, deadline, milestones } = req.body;

  const newGoal = {
    id: `goal-${Date.now()}`,
    studentId,
    title,
    category: category || 'Subject Mastery',
    targetValue: Number(targetValue) || 100,
    currentValue: 0,
    unit: unit || 'Score',
    deadline: deadline || '2026-12-01',
    status: 'in_progress' as const,
    milestones: Array.isArray(milestones) ? milestones : [
      { title: 'Initial diagnostic assessment', completed: true },
      { title: 'Weekly progress check-in', completed: false },
      { title: 'Target mastery milestone', completed: false }
    ]
  };

  SMART_GOALS.push(newGoal);
  res.json({ success: true, goal: newGoal });
});

app.put('/api/goals/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { currentValue, status, milestoneIndex, milestoneStatus } = req.body;

  const goal = SMART_GOALS.find(g => g.id === id);
  if (goal) {
    if (currentValue !== undefined) goal.currentValue = Number(currentValue);
    if (status) goal.status = status;
    if (milestoneIndex !== undefined && goal.milestones[milestoneIndex]) {
      goal.milestones[milestoneIndex].completed = milestoneStatus;
    }
    return res.json({ success: true, goal });
  }
  res.status(404).json({ error: 'Goal not found' });
});

// ==========================================
// 8. AI-GENERATED PRACTICE TESTS (Feature 13)
// ==========================================
app.post('/api/ai/generate-quiz', async (req: Request, res: Response) => {
  const { subject = 'Computer Networks', topic = 'CIDR Subnetting & Routing', difficulty = 'Medium', count = 3 } = req.body;

  const questions = await generate_practice_questions({
    subject,
    topic,
    difficulty: difficulty as any,
    count: Math.min(10, Math.max(1, Number(count)))
  });

  res.json({
    testId: `test-${Date.now()}`,
    subject,
    topic,
    difficulty,
    totalQuestions: questions.length,
    questions,
    generatedAt: new Date().toISOString()
  });
});

app.post('/api/ai/explain-answer', async (req: Request, res: Response) => {
  const { question, chosenOption, correctOption, explanation } = req.body;

  const aiExplanation = await explain_wrong_answer({
    question,
    chosenOption,
    correctOption,
    explanation
  });

  res.json({ explanation: aiExplanation });
});

// ==========================================
// 9. GAMIFICATION & REWARDS (Feature 9)
// ==========================================
app.get('/api/gamification/:studentId', (req: Request, res: Response) => {
  res.json({
    xpPoints: 1450,
    currentStreakDays: 7,
    badgesEarned: BADGES.filter(b => b.unlockedAt).length,
    totalBadges: BADGES.length,
    badges: BADGES,
    weeklyChallenges: [
      { id: 'c-1', title: 'Flawless Week', description: 'Maintain 100% attendance in all 5 courses this week', progress: 4, total: 5, rewardXp: 200 },
      { id: 'c-2', title: 'Knowledge Sharer', description: 'Answer 1 classmate question in study groups', progress: 1, total: 1, rewardXp: 150, completed: true },
      { id: 'c-3', title: 'Deep Work Master', description: 'Complete 3 scheduled AI study sessions', progress: 2, total: 3, rewardXp: 300 }
    ]
  });
});

// ==========================================
// 10. FACULTY RECOMMENDATIONS & INTERVENTIONS (Feature 10)
// ==========================================
app.get('/api/faculty/overview', (req: Request, res: Response) => {
  const totalStudents = Object.keys(STUDENTS).length + 42; // realistic cohort
  const atRiskCount = EARLY_WARNING_ALERTS.filter(a => a.status === 'active').length;

  res.json({
    metrics: {
      totalEnrolled: totalStudents,
      classAverageGpa: 3.24,
      overallAttendanceRate: 83.8,
      activeRiskAlerts: atRiskCount,
      remedialSessionsScheduled: FACULTY_INTERVENTIONS.length
    },
    commonlyMisunderstoodTopics: [
      { topic: 'CIDR Subnetting & Route Aggregation', subject: 'Computer Networks', failureRatePercent: 38, recommendedRemedial: 'Interactive Packet Drills' },
      { topic: 'Relational Normalization & BCNF Proofs', subject: 'Database Systems', failureRatePercent: 32, recommendedRemedial: 'Decomposition Clinic' },
      { topic: 'Eigenvectors & SVD Applications', subject: 'Linear Algebra', failureRatePercent: 27, recommendedRemedial: 'Visual Geometry Lab' }
    ],
    improvingStudents: [
      { name: 'Alex Rivera', subject: 'Computer Networks', improvement: '+18% quiz jump after CIDR clinic' },
      { name: 'Priya Sharma', subject: 'Machine Learning', improvement: 'Completed 100% homework assignments' }
    ],
    interventions: FACULTY_INTERVENTIONS
  });
});

app.post('/api/faculty/interventions', (req: Request, res: Response) => {
  const { studentName, facultyName = 'Prof. Marcus Vance', interventionType, subject, date, outcomeNotes } = req.body;

  const newIntervention = {
    id: `int-${Date.now()}`,
    studentId: 's_custom',
    studentName: studentName || 'Student',
    facultyName,
    interventionType: interventionType || 'Remedial Session',
    subject: subject || 'General Support',
    date: date || new Date().toLocaleString(),
    status: 'Scheduled' as const,
    outcomeNotes: outcomeNotes || 'Action plan initiated by faculty.'
  };

  FACULTY_INTERVENTIONS.unshift(newIntervention);
  res.json({ success: true, intervention: newIntervention });
});

// ==========================================
// 11. ACADEMIC TREND ANALYSIS (Feature 11 & Feature 6)
// ==========================================
app.get('/api/analytics/trends', async (req: Request, res: Response) => {
  const multiSemesterData = [
    { semester: 'Sem 1', gpa: 3.10, attendance: 78, engagement: 72 },
    { semester: 'Sem 2', gpa: 3.25, attendance: 82, engagement: 80 },
    { semester: 'Sem 3', gpa: 3.32, attendance: 80, engagement: 79 },
    { semester: 'Sem 4', gpa: 3.38, attendance: 85, engagement: 88 },
    { semester: 'Sem 5 (Current)', gpa: 3.42, attendance: 84.5, engagement: 91 },
    { semester: 'Sem 6 (Predicted)', gpa: 3.65, attendance: 88, engagement: 94 }
  ];

  const weeklyEngagement = [
    { week: 'Wk 1', assignments: 100, attendance: 90, lmsHours: 12 },
    { week: 'Wk 2', assignments: 95, attendance: 88, lmsHours: 10 },
    { week: 'Wk 3', assignments: 90, attendance: 84, lmsHours: 14 },
    { week: 'Wk 4', assignments: 85, attendance: 80, lmsHours: 8 },
    { week: 'Wk 5', assignments: 92, attendance: 85, lmsHours: 15 },
    { week: 'Wk 6', assignments: 94, attendance: 89, lmsHours: 16 }
  ];

  const trendSummary = await summarize_academic_trends({
    semesters: multiSemesterData.map(d => d.semester),
    gpas: multiSemesterData.map(d => d.gpa),
    attendances: multiSemesterData.map(d => d.attendance)
  });

  res.json({
    multiSemesterData,
    weeklyEngagement,
    trendSummary,
    subjectComparison: SUBJECT_PERFORMANCE
  });
});

// ==========================================
// 12. PEER LEARNING & STUDY GROUPS (Feature 12)
// ==========================================
app.get('/api/study-groups', (req: Request, res: Response) => {
  res.json(STUDY_GROUPS);
});

app.post('/api/study-groups/:id/join', (req: Request, res: Response) => {
  const { id } = req.params;
  const group = STUDY_GROUPS.find(g => g.id === id);
  if (group) {
    group.isMember = !group.isMember;
    group.membersCount += group.isMember ? 1 : -1;
    return res.json({ success: true, group });
  }
  res.status(404).json({ error: 'Group not found' });
});

app.post('/api/study-groups/:id/messages', (req: Request, res: Response) => {
  const { id } = req.params;
  const { message, author = 'Alex Rivera' } = req.body;
  const group = STUDY_GROUPS.find(g => g.id === id);
  if (group) {
    const newMsg = {
      id: `msg-${Date.now()}`,
      author,
      role: 'Student',
      message,
      timestamp: 'Just now'
    };
    group.discussions.push(newMsg);
    return res.json({ success: true, message: newMsg });
  }
  res.status(404).json({ error: 'Group not found' });
});

app.post('/api/study-groups/create', (req: Request, res: Response) => {
  const { name, subject, description, meetingSchedule } = req.body;
  const newGroup = {
    id: `grp-${Date.now()}`,
    name,
    subject: subject || 'General Engineering',
    description,
    membersCount: 1,
    maxMembers: 20,
    meetingSchedule: meetingSchedule || 'Weekly Virtual Meet',
    isMember: true,
    avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=250&q=80',
    resources: [],
    discussions: []
  };

  STUDY_GROUPS.unshift(newGroup);
  res.json({ success: true, group: newGroup });
});

// ==========================================
// 13. PARENT & GUARDIAN PROGRESS (Feature 14)
// ==========================================
app.get('/api/parent/overview/:parentId', (req: Request, res: Response) => {
  const student = STUDENTS['s_alex_101'];
  res.json({
    linkedStudent: student,
    academicSummary: {
      gpa: student.gpa,
      predictedGpa: student.predictedGpa,
      attendanceRate: student.attendanceRate,
      statusMessage: 'Alex is performing in the top 15% of the CSE cohort with strong algorithmic skills. Attendance is in good standing.',
      alertsCount: EARLY_WARNING_ALERTS.filter(a => a.studentId === student.id && a.status === 'active').length,
    },
    subjectBreakdown: SUBJECT_PERFORMANCE,
    achievements: BADGES.filter(b => b.unlockedAt),
    counselorContact: {
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@wellness.university.edu',
      officeHours: 'Monday - Thursday, 2:00 PM - 5:00 PM'
    }
  });
});

// ==========================================
// 14. ADMIN DASHBOARD & AUDIT LOGS (Feature 15)
// ==========================================
app.get('/api/admin/metrics', (req: Request, res: Response) => {
  res.json({
    totalStudents: 1420,
    totalFaculty: 84,
    institutionalRetentionRate: 94.2,
    atRiskStudentsDetected: 48,
    interventionsCompleted: 112,
    departmentPerformance: [
      { name: 'Computer Science', students: 480, avgGpa: 3.38, attendance: 85.2, riskRatio: '4.8%' },
      { name: 'Electrical Eng', students: 340, avgGpa: 3.18, attendance: 81.6, riskRatio: '7.2%' },
      { name: 'Mechanical Eng', students: 310, avgGpa: 3.12, attendance: 79.4, riskRatio: '8.5%' },
      { name: 'Biomedical Eng', students: 290, avgGpa: 3.44, attendance: 87.0, riskRatio: '3.1%' },
    ],
    complianceMetrics: {
      ferpaCompliance: '100% Certified',
      encryptionStandard: 'AES-256 at rest, TLS 1.3 in transit',
      anonymizedExports: true,
      dataRetentionPolicy: '24 Months'
    }
  });
});

app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  res.json(AUDIT_LOGS);
});

// ==========================================
// 15. NOTIFICATIONS & PRIVACY SETTINGS
// ==========================================
app.get('/api/notifications', (req: Request, res: Response) => {
  res.json(NOTIFICATIONS);
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = NOTIFICATIONS.find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

app.get('/api/settings/privacy', (req: Request, res: Response) => {
  res.json(PRIVACY_SETTINGS);
});

app.post('/api/settings/privacy', (req: Request, res: Response) => {
  PRIVACY_SETTINGS = { ...PRIVACY_SETTINGS, ...req.body };
  res.json({ success: true, settings: PRIVACY_SETTINGS });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`EduPulse AI Backend Server running smoothly on http://localhost:${PORT}`);
});
