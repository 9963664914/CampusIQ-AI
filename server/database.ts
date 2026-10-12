import {
  User,
  StudentProfile,
  SubjectPerformance,
  EarlyWarningAlert,
  SmartGoal,
  StudyTask,
  Badge,
  StudyGroup,
  FacultyIntervention,
  QuizQuestion,
  NotificationItem,
  AuditLog
} from './types';

// ==========================================
// 1. DEMO USERS & PERSONAS
// ==========================================
export const USERS: Record<string, User> = {
  student: {
    id: 'u_student_1',
    name: 'Alex Rivera',
    email: 'alex.rivera@edu.university.edu',
    role: 'student',
    studentId: 's_alex_101',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    bio: 'Junior Year, CSE. Aiming for AI specialization & Dean\'s Honor List.',
  },
  faculty: {
    id: 'u_faculty_1',
    name: 'Prof. Marcus Vance',
    email: 'm.vance@faculty.university.edu',
    role: 'faculty',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor & Academic Counselor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    bio: 'Course Coordinator for Data Structures and Machine Learning.',
  },
  counselor: {
    id: 'u_counselor_1',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@wellness.university.edu',
    role: 'counselor',
    department: 'Student Academic Well-being & Counseling Cell',
    designation: 'Lead Educational Psychologist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    bio: 'Dedicated to student mental resilience, exam anxiety management & career alignment.',
  },
  parent: {
    id: 'u_parent_1',
    name: 'Sarah Rivera',
    email: 'sarah.rivera@gmail.com',
    role: 'parent',
    studentId: 's_alex_101',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    bio: 'Parent/Guardian of Alex Rivera (CSE Sem 5).',
  },
  admin: {
    id: 'u_admin_1',
    name: 'Dean Robert Sterling',
    email: 'r.sterling@admin.university.edu',
    role: 'admin',
    department: 'Office of Academic Affairs & Institutional Research',
    designation: 'Dean of Academic Analytics & Accreditation',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    bio: 'Institutional data strategist overseeing NAAC/ABET compliance & campus learning outcomes.',
  },
};

// ==========================================
// 2. STUDENTS DATASET
// ==========================================
export const STUDENTS: Record<string, StudentProfile> = {
  s_alex_101: {
    id: 's_alex_101',
    name: 'Alex Rivera',
    email: 'alex.rivera@edu.university.edu',
    rollNo: 'CS-2023-042',
    semester: 5,
    department: 'Computer Science & Engineering',
    gpa: 3.42,
    predictedGpa: 3.65,
    attendanceRate: 84.5,
    assignmentCompletionRate: 91.0,
    riskLevel: 'Low',
    riskScore: 24,
    confidenceScore: 92,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    enrolledCourses: ['CS301: Data Structures', 'CS304: Database Systems', 'CS308: Computer Networks', 'MA302: Linear Algebra', 'CS312: Machine Learning'],
    weakAreas: ['Graph Theory Algorithms', 'Relational Normalization 3NF/BCNF', 'Subnetting & CIDR'],
    strengths: ['Dynamic Programming', 'SQL Query Optimization', 'Convolutional Neural Networks'],
    parentName: 'Sarah Rivera',
    counselorAssigned: 'Dr. Elena Rostova',
  },
  s_jordan_102: {
    id: 's_jordan_102',
    name: 'Jordan Chen',
    email: 'jordan.c@edu.university.edu',
    rollNo: 'CS-2023-088',
    semester: 5,
    department: 'Computer Science & Engineering',
    gpa: 2.15,
    predictedGpa: 2.05,
    attendanceRate: 64.0,
    assignmentCompletionRate: 58.0,
    riskLevel: 'High',
    riskScore: 78,
    confidenceScore: 89,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
    enrolledCourses: ['CS301: Data Structures', 'CS304: Database Systems', 'MA302: Linear Algebra'],
    weakAreas: ['Asymptotic Analysis', 'Eigenvalues & Vectors', 'Transaction ACID properties'],
    strengths: ['Frontend UI', 'HTML/CSS'],
    parentName: 'Michael Chen',
    counselorAssigned: 'Dr. Elena Rostova',
  },
  s_priya_103: {
    id: 's_priya_103',
    name: 'Priya Sharma',
    email: 'priya.s@edu.university.edu',
    rollNo: 'CS-2023-112',
    semester: 5,
    department: 'Computer Science & Engineering',
    gpa: 2.85,
    predictedGpa: 3.10,
    attendanceRate: 72.5,
    assignmentCompletionRate: 78.0,
    riskLevel: 'Medium',
    riskScore: 48,
    confidenceScore: 86,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    enrolledCourses: ['CS301: Data Structures', 'CS308: Computer Networks', 'MA302: Linear Algebra'],
    weakAreas: ['Packet Routing protocols (BGP/OSPF)', 'Linear Transformations'],
    strengths: ['Data structures implementation', 'Python scripting'],
    parentName: 'Rajesh Sharma',
    counselorAssigned: 'Prof. Marcus Vance',
  },
  s_liam_104: {
    id: 's_liam_104',
    name: 'Liam O\'Connor',
    email: 'liam.oc@edu.university.edu',
    rollNo: 'CS-2023-019',
    semester: 5,
    department: 'Computer Science & Engineering',
    gpa: 3.91,
    predictedGpa: 3.95,
    attendanceRate: 96.0,
    assignmentCompletionRate: 98.0,
    riskLevel: 'Low',
    riskScore: 8,
    confidenceScore: 96,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80',
    enrolledCourses: ['CS301: Data Structures', 'CS304: Database Systems', 'CS312: Machine Learning'],
    weakAreas: ['None identified'],
    strengths: ['Algorithmic efficiency', 'Neural Networks', 'Database tuning'],
    parentName: 'Patricia O\'Connor',
    counselorAssigned: 'Prof. Marcus Vance',
  }
};

// ==========================================
// 3. SUBJECT-WISE DETAILED MARKS & PERFORMANCE
// ==========================================
export const SUBJECT_PERFORMANCE: SubjectPerformance[] = [
  {
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    credits: 4,
    attendance: 88,
    internalMarks: 42, // out of 50
    assignmentScore: 94,
    quizScore: 88,
    predictedGrade: 'A',
    riskStatus: 'Safe',
    improvementAreas: ['Graph cycle detection', 'Red-black trees balancing'],
  },
  {
    code: 'CS304',
    name: 'Database Management Systems',
    credits: 4,
    attendance: 82,
    internalMarks: 36,
    assignmentScore: 85,
    quizScore: 78,
    predictedGrade: 'B+',
    riskStatus: 'Safe',
    improvementAreas: ['BCNF decomposition proofs', 'Two-phase locking protocol'],
  },
  {
    code: 'CS308',
    name: 'Computer Networks & Security',
    credits: 3,
    attendance: 76,
    internalMarks: 29,
    assignmentScore: 72,
    quizScore: 68,
    predictedGrade: 'B',
    riskStatus: 'Attention',
    improvementAreas: ['Subnet masking & CIDR calculations', 'TCP congestion avoidance algorithms'],
  },
  {
    code: 'MA302',
    name: 'Linear Algebra & Optimization',
    credits: 4,
    attendance: 90,
    internalMarks: 45,
    assignmentScore: 96,
    quizScore: 92,
    predictedGrade: 'A+',
    riskStatus: 'Safe',
    improvementAreas: ['Singular value decomposition applications'],
  },
  {
    code: 'CS312',
    name: 'Machine Learning Foundations',
    credits: 4,
    attendance: 86,
    internalMarks: 38,
    assignmentScore: 90,
    quizScore: 84,
    predictedGrade: 'A-',
    riskStatus: 'Safe',
    improvementAreas: ['Backpropagation gradient derivation', 'Regularization (L1 vs L2) impact'],
  },
];

// ==========================================
// 4. EARLY WARNING ALERTS
// ==========================================
export let EARLY_WARNING_ALERTS: EarlyWarningAlert[] = [
  {
    id: 'ewa-201',
    studentId: 's_jordan_102',
    studentName: 'Jordan Chen',
    studentRoll: 'CS-2023-088',
    department: 'Computer Science',
    severity: 'critical',
    triggerType: 'Attendance Drop',
    description: 'Attendance in Database Systems fell to 54% over the last 3 consecutive weeks. Missed Midterm exam #1.',
    createdAt: '2026-10-10 09:30',
    status: 'active',
    assignedTo: 'Prof. Marcus Vance',
    facultyNotes: 'Attempted phone call, left email notice.',
    recommendedAction: 'Mandatory parent-teacher conference and academic probation warning notice.',
  },
  {
    id: 'ewa-202',
    studentId: 's_priya_103',
    studentName: 'Priya Sharma',
    studentRoll: 'CS-2023-112',
    department: 'Computer Science',
    severity: 'medium',
    triggerType: 'Missing Assignments',
    description: 'Unsubmitted assignments in Computer Networks (Lab 3 and Lab 4). Quiz score was 55%.',
    createdAt: '2026-10-11 14:15',
    status: 'acknowledged',
    assignedTo: 'Prof. Marcus Vance',
    facultyNotes: 'Student informed about submission extension till Friday.',
    recommendedAction: 'Connect with peer tutor Liam O\'Connor for lab support.',
  },
  {
    id: 'ewa-203',
    studentId: 's_alex_101',
    studentName: 'Alex Rivera',
    studentRoll: 'CS-2023-042',
    department: 'Computer Science',
    severity: 'low',
    triggerType: 'Sudden Grade Decline',
    description: 'Quiz 2 score in Computer Networks dropped by 18 points compared to Quiz 1.',
    createdAt: '2026-10-09 11:00',
    status: 'resolved',
    assignedTo: 'Dr. Elena Rostova',
    facultyNotes: 'Resolved: Alex attended review clinic on CIDR subnetting. Re-quiz score 88%.',
    recommendedAction: 'Completed remedial module on packet switching.',
  },
  {
    id: 'ewa-204',
    studentId: 's_ethan_105',
    studentName: 'Ethan Brooks',
    studentRoll: 'CS-2023-057',
    department: 'Computer Science',
    severity: 'high',
    triggerType: 'Failed Midterm',
    description: 'Scored 14/50 on Linear Algebra Midterm. Attendance hovering at 68%.',
    createdAt: '2026-10-08 16:45',
    status: 'in_progress',
    assignedTo: 'Dr. Elena Rostova',
    facultyNotes: 'Scheduled remedial workshop session for this Wednesday 3 PM.',
    recommendedAction: 'Enroll in weekly supplemental math tutorial.',
  }
];

// ==========================================
// 5. SMART GOALS
// ==========================================
export let SMART_GOALS: SmartGoal[] = [
  {
    id: 'goal-1',
    studentId: 's_alex_101',
    title: 'Achieve 3.7+ Semester GPA',
    category: 'GPA',
    targetValue: 3.70,
    currentValue: 3.42,
    unit: 'GPA',
    deadline: '2026-12-15',
    status: 'in_progress',
    milestones: [
      { title: 'Score >= 40/50 on all internal midterms', completed: true },
      { title: 'Submit all 6 programming assignments before deadline', completed: true },
      { title: 'Score 90%+ on Linear Algebra final exam', completed: false },
      { title: 'Raise Computer Networks to A-', completed: false },
    ],
  },
  {
    id: 'goal-2',
    studentId: 's_alex_101',
    title: 'Maintain 90%+ Overall Attendance',
    category: 'Attendance',
    targetValue: 90.0,
    currentValue: 84.5,
    unit: '%',
    deadline: '2026-11-30',
    status: 'in_progress',
    milestones: [
      { title: 'Zero unexcused absences in October', completed: true },
      { title: 'Attend all Monday 8:00 AM Networks lectures', completed: false },
      { title: 'Complete lab make-up attendance session', completed: true },
    ],
  },
  {
    id: 'goal-3',
    studentId: 's_alex_101',
    title: 'Complete LeetCode 75 Algorithm Problems',
    category: 'Skill',
    targetValue: 75,
    currentValue: 58,
    unit: 'Problems',
    deadline: '2026-11-20',
    status: 'in_progress',
    milestones: [
      { title: 'Array & String manipulation (15/15)', completed: true },
      { title: 'Binary Trees & BST traversal (15/15)', completed: true },
      { title: 'Graph DFS/BFS & Dijkstra (14/15)', completed: false },
      { title: 'Dynamic Programming patterns (14/30)', completed: false },
    ],
  },
];

// ==========================================
// 6. STUDY PLANNER TASKS & SCHEDULE
// ==========================================
export let STUDY_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    studentId: 's_alex_101',
    subject: 'Computer Networks',
    title: 'Master CIDR Subnetting & IP addressing practice set',
    durationMinutes: 45,
    date: '2026-10-13',
    timeSlot: '04:00 PM - 04:45 PM',
    priority: 'High',
    completed: false,
    type: 'Problem Solving',
  },
  {
    id: 'task-2',
    studentId: 's_alex_101',
    subject: 'Data Structures',
    title: 'Review AVL Tree single & double rotation derivations',
    durationMinutes: 30,
    date: '2026-10-13',
    timeSlot: '05:00 PM - 05:30 PM',
    completed: true,
    priority: 'Medium',
    type: 'Revision',
  },
  {
    id: 'task-3',
    studentId: 's_alex_101',
    subject: 'Machine Learning',
    title: 'Implement Gradient Descent from scratch in Python',
    durationMinutes: 60,
    date: '2026-10-13',
    timeSlot: '07:00 PM - 08:00 PM',
    priority: 'High',
    completed: false,
    type: 'Assignment',
  },
  {
    id: 'task-4',
    studentId: 's_alex_101',
    subject: 'DBMS',
    title: 'Watch video module on BCNF decomposition examples',
    durationMinutes: 40,
    date: '2026-10-14',
    timeSlot: '04:30 PM - 05:10 PM',
    priority: 'Medium',
    completed: false,
    type: 'Video Lecture',
  },
  {
    id: 'task-5',
    studentId: 's_alex_101',
    subject: 'Linear Algebra',
    title: 'Solve Chapter 4 problem set on Eigenvectors & Diagonalization',
    durationMinutes: 50,
    date: '2026-10-14',
    timeSlot: '06:00 PM - 06:50 PM',
    priority: 'Low',
    completed: false,
    type: 'Problem Solving',
  },
  {
    id: 'task-6',
    studentId: 's_alex_101',
    subject: 'Computer Networks',
    title: 'Take mock test on OSI layer protocols & TCP handshake',
    durationMinutes: 30,
    date: '2026-10-15',
    timeSlot: '05:00 PM - 05:30 PM',
    priority: 'High',
    completed: false,
    type: 'Revision',
  },
];

// ==========================================
// 7. GAMIFICATION & BADGES
// ==========================================
export const BADGES: Badge[] = [
  {
    id: 'badge-1',
    title: '7-Day Study Streak',
    description: 'Completed scheduled study sessions 7 consecutive days',
    icon: 'flame',
    category: 'Consistency',
    unlockedAt: '2026-10-12',
    progressPercent: 100,
  },
  {
    id: 'badge-2',
    title: 'Quiz Champion',
    description: 'Scored 90%+ in 5 consecutive AI practice tests',
    icon: 'trophy',
    category: 'Mastery',
    unlockedAt: '2026-10-09',
    progressPercent: 100,
  },
  {
    id: 'badge-3',
    title: 'Turnaround Hero',
    description: 'Boosted a subject score from B to A- within 30 days',
    icon: 'trending-up',
    category: 'Improvement',
    unlockedAt: '2026-10-04',
    progressPercent: 100,
  },
  {
    id: 'badge-4',
    title: 'Community Scholar',
    description: 'Shared 3 verified study notes in peer study circles',
    icon: 'users',
    category: 'Peer Support',
    unlockedAt: undefined,
    progressPercent: 66,
  },
  {
    id: 'badge-5',
    title: 'Early Bird',
    description: 'Submitted 5 coursework assignments 24h ahead of deadline',
    icon: 'clock',
    category: 'Consistency',
    unlockedAt: undefined,
    progressPercent: 80,
  },
  {
    id: 'badge-6',
    title: 'Algorithm Wizard',
    description: 'Solved all Graph & Dynamic Programming problem tracks',
    icon: 'zap',
    category: 'Mastery',
    unlockedAt: undefined,
    progressPercent: 75,
  },
];

// ==========================================
// 8. STUDY GROUPS
// ==========================================
export let STUDY_GROUPS: StudyGroup[] = [
  {
    id: 'grp-1',
    name: 'Algorithm Aces (DSA Lab)',
    subject: 'Data Structures & Algorithms',
    description: 'Collaborative group solving advanced tree & dynamic programming problems, code reviews, and mock technical tests.',
    membersCount: 14,
    maxMembers: 20,
    meetingSchedule: 'Tuesdays & Thursdays, 6:00 PM (Google Meet / Library 2B)',
    isMember: true,
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=250&q=80',
    resources: [
      { title: 'Tree Balancing Cheat Sheet (AVL & Red-Black)', type: 'PDF', link: '#', author: 'Alex Rivera' },
      { title: 'Dijkstra vs A* Algorithm Visualizer Code', type: 'GitHub', link: '#', author: 'Liam O\'Connor' },
    ],
    discussions: [
      { id: 'd-1', author: 'Liam O\'Connor', role: 'Student', message: 'Remember tomorrow we will solve LeetCode #207 Course Schedule together using topological sort!', timestamp: '2 hours ago' },
      { id: 'd-2', author: 'Alex Rivera', role: 'Student', message: 'I shared the Python DFS implementation in the resources folder. Let me know if anyone wants to review before class!', timestamp: '35 mins ago' },
    ]
  },
  {
    id: 'grp-2',
    name: 'ML Foundations & Math Circle',
    subject: 'Machine Learning',
    description: 'Working together through linear algebra proofs, cost function derivations, and PyTorch / Scikit-Learn labs.',
    membersCount: 9,
    maxMembers: 15,
    meetingSchedule: 'Wednesdays 5:30 PM (CS Innovation Lab 1)',
    isMember: false,
    avatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=250&q=80',
    resources: [
      { title: 'Gradient Descent Mathematical Derivations', type: 'Notebook', link: '#', author: 'Prof. Marcus Vance' },
      { title: 'Matrix Eigenvalues Illustrated in 3D', type: 'Interactive Link', link: '#', author: 'Priya Sharma' },
    ],
    discussions: [
      { id: 'd-3', author: 'Priya Sharma', role: 'Student', message: 'Anyone having trouble with question 4 on SVD decomposition in the homework?', timestamp: 'Yesterday' },
    ]
  },
  {
    id: 'grp-3',
    name: 'Networks & Protocol Deep Dive',
    subject: 'Computer Networks',
    description: 'Focus on Wireshark packet traces, subnet calculations, routing protocols, and exam prep to pull up our class average!',
    membersCount: 18,
    maxMembers: 25,
    meetingSchedule: 'Saturdays 10:00 AM (Virtual Study Room)',
    isMember: true,
    avatar: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=250&q=80',
    resources: [
      { title: 'Subnetting Cheat Sheet: 30-Second CIDR Method', type: 'PDF', link: '#', author: 'Jordan Chen' },
      { title: 'Wireshark TCP Handshake Trace Sample', type: 'Pcap', link: '#', author: 'Alex Rivera' },
    ],
    discussions: [
      { id: 'd-4', author: 'Alex Rivera', role: 'Student', message: 'The CIDR cheat sheet really helped me during last week\'s quiz retake!', timestamp: '3 days ago' },
    ]
  }
];

// ==========================================
// 9. FACULTY INTERVENTIONS
// ==========================================
export let FACULTY_INTERVENTIONS: FacultyIntervention[] = [
  {
    id: 'int-1',
    studentId: 's_jordan_102',
    studentName: 'Jordan Chen',
    facultyName: 'Prof. Marcus Vance',
    interventionType: '1-on-1 Mentorship',
    subject: 'Database Systems',
    date: '2026-10-14 15:30',
    status: 'Scheduled',
    outcomeNotes: 'Review attendance hurdles, offer makeup assignment for Lab 2, establish weekly check-in.',
  },
  {
    id: 'int-2',
    studentId: 's_priya_103',
    studentName: 'Priya Sharma',
    facultyName: 'Prof. Marcus Vance',
    interventionType: 'Remedial Session',
    subject: 'Computer Networks',
    date: '2026-10-12 11:00',
    status: 'Completed',
    outcomeNotes: 'Walked through BGP routing tables. Priya demonstrated clear grasp of distance-vector algorithms after the 45m clinic.',
  },
  {
    id: 'int-3',
    studentId: 's_alex_101',
    studentName: 'Alex Rivera',
    facultyName: 'Dr. Elena Rostova',
    interventionType: 'Peer Tutor Match',
    subject: 'Computer Networks',
    date: '2026-10-09 14:00',
    status: 'Completed',
    outcomeNotes: 'Paired Alex with Networks TA for CIDR drills. Remarkable recovery in subsequent quiz from 68% to 88%.',
  }
];

// ==========================================
// 10. PRE-SEEDED QUIZ QUESTION BANK
// ==========================================
export const DEFAULT_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-1',
    subject: 'Data Structures & Algorithms',
    topic: 'Graph Algorithms',
    difficulty: 'Medium',
    question: 'Which of the following shortest path algorithms supports graphs with negative edge weights as long as there are no negative weight cycles?',
    options: ['Dijkstra\'s Algorithm', 'Bellman-Ford Algorithm', 'Prim\'s Algorithm', 'Kruskal\'s Algorithm'],
    correctIndex: 1,
    explanation: 'Bellman-Ford algorithm can handle negative weight edges and can also detect negative weight cycles by relaxing all edges |V| - 1 times, whereas Dijkstra assumes non-negative edge weights.',
  },
  {
    id: 'q-2',
    subject: 'Database Management Systems',
    topic: 'Normalization',
    difficulty: 'Hard',
    question: 'A relation R is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial functional dependency X -> Y:',
    options: [
      'Y is a prime attribute',
      'X is a superkey of R',
      'Both X and Y are candidate keys',
      'X is in 3NF and Y is atomic'
    ],
    correctIndex: 1,
    explanation: 'In BCNF, every determinant X in every non-trivial functional dependency X -> Y must strictly be a superkey of relation R. This eliminates anomalies that 3NF might still permit when multiple candidate keys overlap.',
  },
  {
    id: 'q-3',
    subject: 'Computer Networks',
    topic: 'IP Subnetting',
    difficulty: 'Medium',
    question: 'Given an IP address 192.168.10.68 with subnet mask 255.255.255.224 (/27), what is the broadcast address for this subnet?',
    options: ['192.168.10.95', '192.168.10.63', '192.168.10.127', '192.168.10.255'],
    correctIndex: 0,
    explanation: 'With a /27 mask, each block size is 256 - 224 = 32. The subnet ranges are 0-31, 32-63, 64-95. Address 192.168.10.68 falls into the block starting at .64, so the subnet network address is .64 and the broadcast address is 192.168.10.95.',
  },
  {
    id: 'q-4',
    subject: 'Machine Learning Foundations',
    topic: 'Optimization & Regularization',
    difficulty: 'Medium',
    question: 'What is the primary difference in the effect of L1 regularization (Lasso) compared to L2 regularization (Ridge) on model weights?',
    options: [
      'L1 regularizes only neural networks, while L2 regularizes linear regressions',
      'L1 tends to drive coefficients exactly to zero creating sparsity, whereas L2 shrinks weights toward zero without setting them to zero',
      'L2 causes numerical overflow for large weight matrices',
      'L1 prevents underfitting while L2 prevents overfitting'
    ],
    correctIndex: 1,
    explanation: 'Because L1 regularization uses an absolute penalty |w|, its diamond-shaped constraint region has sharp corners along the coordinate axes, frequently driving irrelevant feature weights to exact zero (feature selection / sparsity).',
  },
  {
    id: 'q-5',
    subject: 'Linear Algebra',
    topic: 'Eigenvalues & Vectors',
    difficulty: 'Easy',
    question: 'If λ is an eigenvalue of an invertible square matrix A, what is the corresponding eigenvalue of A⁻¹?',
    options: ['-λ', 'λ²', '1 / λ', '√λ'],
    correctIndex: 2,
    explanation: 'From Av = λv, multiplying both sides by A⁻¹ gives v = λ A⁻¹ v, so A⁻¹ v = (1 / λ) v. Hence, the eigenvalue of A⁻¹ is 1/λ.',
  }
];

// ==========================================
// 11. NOTIFICATIONS
// ==========================================
export let NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'u_student_1',
    title: 'Predicted Grade Improvement Alert',
    message: 'Your recent 88% quiz recovery boosted your predicted grade in Computer Networks from B- to B+.',
    type: 'achievement',
    timestamp: '10 minutes ago',
    read: false,
  },
  {
    id: 'notif-2',
    userId: 'u_student_1',
    title: 'Upcoming Assessment: Machine Learning',
    message: 'Internal Assessment #2 on Neural Network Backpropagation is scheduled for Friday 10:00 AM.',
    type: 'alert',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 'notif-3',
    userId: 'u_student_1',
    title: 'New Study Group Discussion',
    message: 'Liam O\'Connor posted in "Algorithm Aces": "Topological sort review session tomorrow!"',
    type: 'assignment',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'notif-4',
    userId: 'u_faculty_1',
    title: 'Critical Attendance Drop Detected',
    message: 'Jordan Chen (Roll: CS-2023-088) dropped to 54% attendance in DBMS. Early warning generated.',
    type: 'alert',
    timestamp: '1 hour ago',
    read: false,
  },
];

// ==========================================
// 12. AUDIT LOGS (Security & Privacy)
// ==========================================
export let AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-10-13 00:35:12',
    userId: 'u_faculty_1',
    userName: 'Prof. Marcus Vance',
    role: 'Faculty',
    action: 'VIEW_STUDENT_ANALYTICS',
    resource: 'Student Record #s_jordan_102',
    ipAddress: '192.168.1.45 (Campus Intranet)',
    status: 'SUCCESS',
  },
  {
    id: 'log-102',
    timestamp: '2026-10-13 00:20:05',
    userId: 'u_counselor_1',
    userName: 'Dr. Elena Rostova',
    role: 'Counselor',
    action: 'ACKNOWLEDGE_ALERT',
    resource: 'EarlyWarningAlert #ewa-202',
    ipAddress: '192.168.1.82 (Campus Intranet)',
    status: 'SUCCESS',
  },
  {
    id: 'log-103',
    timestamp: '2026-10-12 23:45:10',
    userId: 'u_parent_1',
    userName: 'Sarah Rivera',
    role: 'Parent',
    action: 'VIEW_PARENT_PORTAL',
    resource: 'Student Progress Summary #s_alex_101',
    ipAddress: '98.24.112.5 (External Auth)',
    status: 'SUCCESS',
  },
  {
    id: 'log-104',
    timestamp: '2026-10-12 21:14:33',
    userId: 'u_admin_1',
    userName: 'Dean Robert Sterling',
    role: 'Admin',
    action: 'EXPORT_COMPLIANCE_REPORT',
    resource: 'Institutional At-Risk Roster (Anonymized)',
    ipAddress: '192.168.1.10 (Admin Tier)',
    status: 'SUCCESS',
  },
  {
    id: 'log-105',
    timestamp: '2026-10-12 20:05:19',
    userId: 'unknown_ip',
    userName: 'Anonymous Client',
    role: 'Unauthorized',
    action: 'ACCESS_RESTRICTED_RECORDS',
    resource: '/api/admin/system-secrets',
    ipAddress: '185.220.101.5',
    status: 'DENIED',
  }
];

// ==========================================
// 13. PRIVACY & CONSENT CONFIGURATION
// ==========================================
export let PRIVACY_SETTINGS = {
  dataRetentionMonths: 24,
  anonymizeInAggregates: true,
  parentSharingConsent: true,
  enableAIPersonalization: true,
  lmsTelemetryTracking: true,
  lastAuditExport: '2026-10-01',
};
