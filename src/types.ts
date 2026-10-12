export type AppView =
  | 'landing'
  | 'login'
  | 'student_dashboard'
  | 'faculty_dashboard'
  | 'ai_assistant'
  | 'performance_analytics'
  | 'early_warning'
  | 'study_planner'
  | 'practice_tests'
  | 'study_groups'
  | 'parent_portal'
  | 'admin_dashboard'
  | 'notifications'
  | 'profile_settings';

export type UserRole = 'student' | 'faculty' | 'counselor' | 'parent' | 'admin';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department?: string;
  designation?: string;
  studentId?: string;
  bio?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  semester: number;
  department: string;
  gpa: number;
  predictedGpa: number;
  attendanceRate: number;
  assignmentCompletionRate: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  confidenceScore: number;
  avatar: string;
  enrolledCourses: string[];
  weakAreas: string[];
  strengths: string[];
  parentName?: string;
  counselorAssigned?: string;
}

export interface SubjectPerformance {
  code: string;
  name: string;
  credits: number;
  attendance: number;
  internalMarks: number;
  assignmentScore: number;
  quizScore: number;
  predictedGrade: string;
  riskStatus: 'Safe' | 'Attention' | 'Critical';
  improvementAreas: string[];
}

export interface EarlyWarningAlert {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  department: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggerType: 'Attendance Drop' | 'Failed Midterm' | 'Missing Assignments' | 'Sudden Grade Decline' | 'Low LMS Engagement';
  description: string;
  createdAt: string;
  status: 'active' | 'acknowledged' | 'in_progress' | 'resolved';
  assignedTo: string;
  facultyNotes?: string;
  recommendedAction: string;
}

export interface SmartGoal {
  id: string;
  studentId: string;
  title: string;
  category: 'GPA' | 'Attendance' | 'Skill' | 'Assignment' | 'Subject Mastery';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  status: 'in_progress' | 'completed' | 'behind';
  milestones: { title: string; completed: boolean }[];
}

export interface StudyTask {
  id: string;
  studentId: string;
  subject: string;
  title: string;
  durationMinutes: number;
  date: string;
  timeSlot: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  type: 'Revision' | 'Problem Solving' | 'Assignment' | 'Video Lecture';
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'Consistency' | 'Mastery' | 'Peer Support' | 'Improvement';
  unlockedAt?: string;
  progressPercent: number;
}

export interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  membersCount: number;
  maxMembers: number;
  meetingSchedule: string;
  isMember: boolean;
  avatar: string;
  resources: { title: string; type: string; link: string; author: string }[];
  discussions: { id: string; author: string; role: string; message: string; timestamp: string }[];
}

export interface QuizQuestion {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'alert' | 'assignment' | 'achievement' | 'counselor' | 'system';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  resource: string;
  ipAddress: string;
  status: 'SUCCESS' | 'DENIED';
}
