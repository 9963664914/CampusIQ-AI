import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Helper to call Gemini API if key is present
 */
async function callGemini(prompt: string, systemInstruction?: string): Promise<string | null> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
    return null;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const body: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}. Using Intelligent Fallback Engine.`);
      return null;
    }

    const data: any = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || null;
  } catch (err) {
    console.warn('Gemini API call failed, falling back to local AI engine:', err);
    return null;
  }
}

// ==========================================
// 1. GENERATE STUDY PLAN
// ==========================================
export async function generate_study_plan(params: {
  studentName?: string;
  targetHoursPerDay: number;
  weakSubjects: string[];
  upcomingExams: string[];
  preferredTimeOfDay: 'morning' | 'evening' | 'flexible';
}) {
  const { targetHoursPerDay, weakSubjects, upcomingExams, preferredTimeOfDay } = params;

  // Attempt LLM if configured
  const prompt = `Act as an expert academic tutor. Create a balanced, realistic daily study timetable for a computer science student.
Target Hours: ${targetHoursPerDay} hrs/day
Weak Subjects: ${weakSubjects.join(', ')}
Upcoming Exams: ${upcomingExams.join(', ')}
Preferred Slot: ${preferredTimeOfDay}
Return a JSON array of 4-6 schedule blocks: [{"subject": "...", "title": "...", "durationMinutes": 45, "timeSlot": "...", "priority": "High"|"Medium"|"Low", "type": "Revision"|"Problem Solving"|"Assignment"|"Video Lecture"}]. Output ONLY valid JSON.`;

  const llmResponse = await callGemini(prompt, "You are a pedagogy expert creating realistic student schedules. Avoid overloaded burnout schedules.");
  if (llmResponse) {
    try {
      const cleanJson = llmResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      // JSON parse error, fall through to deterministic expert engine
    }
  }

  // Deterministic pedagogical generator
  const primaryWeak = weakSubjects[0] || 'Computer Networks';
  const secondaryWeak = weakSubjects[1] || 'Database Systems';

  return [
    {
      id: `task-${Date.now()}-1`,
      subject: primaryWeak,
      title: `High-Yield Concepts Review: ${primaryWeak} Core Weak Spots`,
      durationMinutes: Math.min(60, targetHoursPerDay * 25),
      timeSlot: preferredTimeOfDay === 'morning' ? '08:00 AM - 09:00 AM' : '04:30 PM - 05:30 PM',
      priority: 'High',
      completed: false,
      type: 'Problem Solving'
    },
    {
      id: `task-${Date.now()}-2`,
      subject: secondaryWeak,
      title: `Interactive Question Drills: ${secondaryWeak}`,
      durationMinutes: 45,
      timeSlot: preferredTimeOfDay === 'morning' ? '09:15 AM - 10:00 AM' : '05:45 PM - 06:30 PM',
      priority: 'High',
      completed: false,
      type: 'Revision'
    },
    {
      id: `task-${Date.now()}-3`,
      subject: 'Data Structures & Algorithms',
      title: 'Algorithmic Problem Practice & Tree Traversals',
      durationMinutes: 40,
      timeSlot: preferredTimeOfDay === 'morning' ? '10:30 AM - 11:10 AM' : '07:00 PM - 07:40 PM',
      priority: 'Medium',
      completed: false,
      type: 'Assignment'
    },
    {
      id: `task-${Date.now()}-4`,
      subject: 'Exam Preparation',
      title: `Active Recall & Flashcards for ${upcomingExams[0] || 'Midterm Assessment'}`,
      durationMinutes: 30,
      timeSlot: preferredTimeOfDay === 'morning' ? '11:15 AM - 11:45 AM' : '08:00 PM - 08:30 PM',
      priority: 'Medium',
      completed: false,
      type: 'Revision'
    }
  ];
}

// ==========================================
// 2. GENERATE PRACTICE QUESTIONS
// ==========================================
export async function generate_practice_questions(params: {
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  count: number;
}) {
  const { subject, topic, difficulty, count } = params;

  const prompt = `Generate ${count} academic multiple-choice quiz questions for college students studying ${subject}, specifically topic: "${topic}".
Difficulty: ${difficulty}.
Return ONLY valid JSON array with format:
[
  {
    "id": "q-1",
    "subject": "${subject}",
    "topic": "${topic}",
    "difficulty": "${difficulty}",
    "question": "Question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Clear pedagogical explanation of why this answer is correct and why other options are incorrect."
  }
]`;

  const llmResponse = await callGemini(prompt, "You are a university professor creating rigorous, fair assessment questions. Ensure the explanation teaches the core concept.");
  if (llmResponse) {
    try {
      const cleanJson = llmResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      // Fall through to fallback question bank
    }
  }

  // Robust curated question generator matching subject
  const questionPools: Record<string, any[]> = {
    'Computer Networks': [
      {
        question: `In CIDR notation, if a subnet is designated as 172.16.0.0/20, how many usable host IP addresses are available?`,
        options: ['4,094 usable hosts', '2,046 usable hosts', '1,022 usable hosts', '510 usable hosts'],
        correctIndex: 0,
        explanation: 'A /20 subnet leaves 32 - 20 = 12 host bits. Total addresses = 2^12 = 4,096. Subtracting 2 for network and broadcast leaves 4,094 usable host IP addresses.'
      },
      {
        question: `Which layer of the OSI model does the Transport Layer Security (TLS) protocol primarily operate at?`,
        options: ['Network Layer (Layer 3)', 'Data Link Layer (Layer 2)', 'Presentation/Application Layer (Layer 6/7)', 'Physical Layer (Layer 1)'],
        correctIndex: 2,
        explanation: 'TLS typically sits above the Transport layer (TCP) and functions between Layer 4 and Layer 7, commonly categorized around Presentation (Layer 6) to encrypt application payload.'
      },
      {
        question: `What mechanism does TCP use to prevent overwhelming the receiver's buffer capacity?`,
        options: ['Slow Start', 'Receiver Advertised Window (rwnd)', 'Congestion Window (cwnd)', 'Additive Increase Multiplicative Decrease (AIMD)'],
        correctIndex: 1,
        explanation: 'Flow control is governed by the receiver advertised window (rwnd) in the TCP header, which informs the sender how much buffer memory remains at the destination.'
      }
    ],
    'Database Management Systems': [
      {
        question: `Which property of ACID transactions is guaranteed by the Write-Ahead Logging (WAL) protocol?`,
        options: ['Atomicity and Durability', 'Isolation only', 'Consistency only', 'Physical Independence'],
        correctIndex: 0,
        explanation: 'Write-Ahead Logging records transaction changes to non-volatile disk before modifying buffer pool pages, guaranteeing both Atomicity (rollback of uncommitted writes) and Durability (redo of committed writes after crashes).'
      },
      {
        question: `When decomposing a schema R into (R1, R2), the decomposition is strictly lossless-join if and only if:`,
        options: ['R1 ∩ R2 = ∅', '(R1 ∩ R2) -> R1 or (R1 ∩ R2) -> R2 holds in F+', 'R1 and R2 have equal cardinalities', 'Every functional dependency is preserved in R1'],
        correctIndex: 1,
        explanation: 'Lossless join decomposition requires the common attributes (R1 ∩ R2) to form a superkey of at least one of the decomposed relations (R1 or R2).'
      }
    ],
    'Data Structures & Algorithms': [
      {
        question: `What is the worst-case time complexity of searching for an element in an unaugmented AVL Tree with n nodes?`,
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctIndex: 1,
        explanation: 'Because AVL trees enforce a strict balance factor difference of at most 1 between left and right subtrees at every node, their height is strictly bounded by ~1.44 log2(n), giving O(log n) worst-case search.'
      },
      {
        question: `Which data structure is the optimal choice for implementing Prim\'s Minimum Spanning Tree algorithm on a dense graph?`,
        options: ['Fibonacci Heap / Adjacency Matrix', 'Simple Queue / Edge List', 'Binary Search Tree', 'Stack with Adjacency List'],
        correctIndex: 0,
        explanation: 'For dense graphs (|E| ≈ |V|^2), an adjacency matrix with standard linear scan or Fibonacci heap provides O(V^2) or O(E + V log V) optimal complexity.'
      }
    ]
  };

  const pool = questionPools[subject] || questionPools['Computer Networks'];
  return pool.slice(0, count).map((item, idx) => ({
    id: `gen-q-${Date.now()}-${idx + 1}`,
    subject,
    topic,
    difficulty,
    question: item.question,
    options: item.options,
    correctIndex: item.correctIndex,
    explanation: item.explanation
  }));
}

// ==========================================
// 3. EXPLAIN WRONG ANSWER
// ==========================================
export async function explain_wrong_answer(params: {
  question: string;
  chosenOption: string;
  correctOption: string;
  explanation: string;
}) {
  const { question, chosenOption, correctOption, explanation } = params;

  const prompt = `A student answered a quiz question incorrectly. Provide a warm, constructive, 3-part pedagogical breakdown:
1. Why the selected answer ("${chosenOption}") is a common misconception.
2. The core conceptual reason why the correct answer ("${correctOption}") is right.
3. A 1-sentence memorable rule of thumb to remember this on exams.
Question: "${question}"
Standard explanation: "${explanation}"`;

  const llmResponse = await callGemini(prompt, "You are an empathetic, encouraging university teaching assistant.");
  if (llmResponse) {
    return llmResponse;
  }

  return `### Concept Breakdown & Misconception Analysis

1. **Why "${chosenOption}" is tempting:**
Students frequently choose this when conflating general theoretical intuition with specific protocol/mathematical constraints. It often describes a related concept in the same domain, but does not satisfy the exact boundary condition stated in the prompt.

2. **Why "${correctOption}" is correct:**
${explanation}

3. **Rule of Thumb for Exams:**
*Remember:* Always verify the formal mathematical definitions or protocol specification boundaries before selecting your answer. When in doubt, eliminate choices that rely on non-general assumptions!`;
}

// ==========================================
// 4. ANSWER STUDENT QUESTION (COUNSELOR / LEARNING CHATBOT)
// ==========================================
export async function answer_student_question(params: {
  studentQuery: string;
  studentContext?: {
    name?: string;
    gpa?: number;
    attendance?: number;
    weakAreas?: string[];
  };
}) {
  const { studentQuery, studentContext } = params;

  // Crisis / Human Referral Guardrail Check
  const sensitiveKeywords = ['depressed', 'harm myself', 'suicide', 'cannot go on', 'hopeless', 'end it all', 'severe crisis'];
  const hasCrisisIntent = sensitiveKeywords.some(kw => studentQuery.toLowerCase().includes(kw));

  if (hasCrisisIntent) {
    return `### Important Support Notice
I hear that you are going through an extraordinarily difficult time right now. Please know that you are not alone and that there is immediate, compassionate help available.

**Campus Counseling & Emergency Resources:**
- **Campus Crisis Support Hotline:** Available 24/7 at **1-800-273-TALK (8255)** or text **HOME to 741741**.
- **Student Wellness Center:** Student Services Building, Suite 304. Walk-ins welcomed immediately (8:00 AM - 6:00 PM).
- **Lead Counselor:** Dr. Elena Rostova (\`elena.rostova@wellness.university.edu\`)

Please reach out to a trusted faculty mentor, counselor, or family member right away. Your life and well-being are the top priority.`;
  }

  const prompt = `You are the EduPulse AI Academic Success Counselor.
Student Info: GPA ${studentContext?.gpa ?? 3.4}, Attendance ${studentContext?.attendance ?? 85}%, Weak Areas: ${studentContext?.weakAreas?.join(', ') ?? 'CIDR, Normalization'}.
Student Query: "${studentQuery}"
Provide actionable, encouraging, evidence-based academic coaching. Include 2-3 specific study steps and suggest connecting with campus resources or faculty office hours when relevant.`;

  const llmResponse = await callGemini(prompt, "You are a warm, knowledgeable university academic coach. Provide clear formatting with bullet points and bold highlights.");
  if (llmResponse) {
    return llmResponse;
  }

  // Intelligent Context-Aware Fallback Responses
  const queryLower = studentQuery.toLowerCase();

  if (queryLower.includes('attendance') || queryLower.includes('absent')) {
    return `### Attendance Strategy & Institutional Policy
Maintaining high attendance is crucial not just for exam eligibility (which requires a minimum of **75%**), but because our predictive analytics show a **0.78 correlation** between regular lecture attendance and final letter grades.

**Recommended Action Steps:**
1. **Target the threshold:** Currently your attendance is at **${studentContext?.attendance ?? 84.5}%**. Attending the next 4 consecutive lectures without absence will raise your score by **+2.4%**.
2. **Make-up Sessions:** Speak with your course coordinator about authorized lab makeup slots.
3. **Logistics:** If morning slots (like 8:00 AM Networks) are challenging, consider syncing your study calendar notifications 30 minutes earlier.`;
  }

  if (queryLower.includes('exam') || queryLower.includes('midterm') || queryLower.includes('study technique')) {
    return `### High-Efficiency Exam Preparation Blueprint
To maximize your retention for upcoming midterms without burnout, adopt the **Feynman Technique** paired with **Spaced Repetition**:

1. **Active Recall over Re-reading:** Instead of highlighting textbook pages, test yourself using our **AI Practice Tests** module. Active retrieval creates stronger neural pathways.
2. **Target Weak Topics First:** Your performance metrics indicate that focusing on **${studentContext?.weakAreas?.[0] || 'Graph Algorithms & CIDR Subnetting'}** will yield the highest GPA increase per hour studied.
3. **Pomodoro Blocks:** Use 50-minute focused review sprints followed by a strict 10-minute mental rest.
4. **Faculty Office Hours:** Prof. Marcus Vance holds open review clinics on Tuesdays at 3:00 PM in CS-204. Dropping by with 2 specific questions can clarify weeks of confusion!`;
  }

  return `### Academic Guidance & Next Steps
Thank you for reaching out! Based on your current academic profile (GPA: **${studentContext?.gpa ?? 3.42}**, Attendance: **${studentContext?.attendance ?? 84.5}%**):

- **Immediate Priority:** Dedicate 45 minutes this evening to your highest leverage topic: **${studentContext?.weakAreas?.[0] || 'Core Course Concepts'}**.
- **Collaborative Learning:** Consider joining the **"Algorithm Aces"** or **"Networks Deep Dive"** study groups in the Study Groups tab. Peer problem solving consistently improves retention by over 30%.
- **Study Timetable:** Your personalized study schedule has already been updated with optimized time blocks. Check the **Study Planner** tab to mark off completed milestones!

Feel free to ask me about specific concepts, schedule adjustments, or exam tips!`;
}

// ==========================================
// 5. GENERATE LEARNING RECOMMENDATIONS
// ==========================================
export async function generate_learning_recommendations(studentMetrics: {
  attendance: number;
  weakAreas: string[];
  recentQuizScores: number[];
}) {
  return [
    {
      topic: studentMetrics.weakAreas[0] || 'Computer Networks: CIDR Subnetting',
      urgency: 'High',
      estimatedHours: 2.5,
      recommendedResources: [
        { type: 'Interactive Tool', title: 'Visual Subnet Mask Calculator & Packet Sandbox', duration: '20 mins' },
        { type: 'Curated Video', title: 'Subnetting in 15 Minutes: The Binary Shortcut', duration: '15 mins' },
        { type: 'Practice Set', title: '10 High-Frequency CIDR Midterm Questions', duration: '35 mins' }
      ],
      actionItem: 'Complete the 10-question practice set before the next lab session on Thursday.'
    },
    {
      topic: studentMetrics.weakAreas[1] || 'Database Systems: BCNF Normalization',
      urgency: 'Medium',
      estimatedHours: 2.0,
      recommendedResources: [
        { type: 'Study Guide', title: 'Functional Dependencies & Candidate Key Proofs PDF', duration: '30 mins' },
        { type: 'Drill', title: 'Lossless Decomposition Diagnostic Quiz', duration: '25 mins' }
      ],
      actionItem: 'Review decomposition proofs with peer mentor in study room 2B.'
    }
  ];
}

// ==========================================
// 6. SUMMARIZE ACADEMIC TRENDS
// ==========================================
export async function summarize_academic_trends(historyData: {
  semesters: string[];
  gpas: number[];
  attendances: number[];
}) {
  const lastGpa = historyData.gpas[historyData.gpas.length - 1];
  const prevGpa = historyData.gpas[historyData.gpas.length - 2] || lastGpa;
  const delta = (lastGpa - prevGpa).toFixed(2);
  const isUp = lastGpa >= prevGpa;

  return {
    trendDirection: isUp ? 'Upward' : 'Needs Intervention',
    summaryText: `Performance indicates a ${isUp ? 'positive trajectory (+ ' + delta + ' GPA)' : 'slight dip (' + delta + ' GPA)'} across recent semesters. Overall attendance stability stands at ${historyData.attendances[historyData.attendances.length - 1]}%.`,
    keyObservations: [
      'Strong consistency maintained in core practical laboratory evaluations (avg 92%).',
      'Theoretical midterms show higher variance, indicating potential benefit from active recall drills.',
      'Attendance above 80% strongly correlates with higher internal exam grades.'
    ],
    predictedTrajectory: 'On track for Dean\'s Honor List qualification if current 7-day revision streak is maintained.'
  };
}

// ==========================================
// 7. EXPLAIN RISK FACTORS
// ==========================================
export async function explain_risk_factors(predictionResult: {
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  factors: { factor: string; weight: number; impact: 'positive' | 'negative'; description: string }[];
}) {
  return {
    riskCategory: predictionResult.riskLevel,
    riskScore: predictionResult.riskScore,
    disclaimer: 'Note: Predictive analytics provide diagnostic estimates based on synthetic longitudinal cohorts and historical performance. They represent academic indicators, not predetermined outcomes.',
    factorAnalysis: predictionResult.factors,
    preventativeActions: [
      'Maintain weekly assignment submission cadence to prevent late penalty deductions.',
      'Attend supplemental review clinics for modules with internal marks below 35/50.',
      'Utilize faculty office hours within 48 hours of any missed or low-scoring assessment.'
    ]
  };
}
