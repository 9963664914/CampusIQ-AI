import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  BookOpen,
  Calendar,
  AlertCircle,
  Clock,
  UserCheck,
  Bot,
  User,
  RefreshCw,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { api } from '../../services/api';
import { AppView } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface AILearningAssistantProps {
  onNavigate: (view: AppView) => void;
}

export const AILearningAssistant: React.FC<AILearningAssistantProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Hello Alex! 👋 I am your **EduPulse AI Academic Coach & Counselor**.

I have continuous access to your course metrics (GPA **3.42**, Attendance **84.5%**, enrolled in **5 subjects**). 

Here are areas where I can assist you right now:
- 📊 Formulate a targeted strategy to boost **Computer Networks** to an **A-**
- ⏰ Generate a realistic daily timetable around your weak spots
- 💡 Explain complex concepts like **CIDR Subnetting** or **BCNF Decomposition**
- 🧘 Share scientifically proven exam anxiety reduction & spaced repetition techniques

What would you like to focus on today?`,
      timestamp: '10:00 AM'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'How do I calculate subnets quickly for my Computer Networks exam?',
    'I feel overwhelmed by 3 midterms in one week. Help me prioritize.',
    'What should I focus on to raise my GPA to 3.7 this semester?',
    'Can you generate a 3-hour study timetable for this evening?'
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.askCounselor(text, 's_alex_101');
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        timestamp: res.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'I encountered an issue processing that query. Please verify server connectivity.',
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HEADER */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-accent-purple">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white">AI Learning Assistant & Academic Counselor</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
              Features 3 & 5
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Non-judgmental conversational tutor, curriculum mentor, and psychological resilience assistant powered by Google Gemini AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('practice_tests')}
            className="text-xs px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all"
          >
            Practice Quiz
          </button>
          <button
            onClick={() => onNavigate('study_planner')}
            className="text-xs px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all"
          >
            Study Timetable
          </button>
        </div>
      </div>

      {/* 2. CHAT CONTAINER */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden flex flex-col h-[650px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white'
                    : 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[10px] font-mono ${
                    msg.sender === 'user' ? 'text-brand-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>EduPulse AI is analyzing your coursework and preparing guidance...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Prompts Pill Carousel */}
        <div className="px-6 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-semibold uppercase text-slate-400 shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-400" /> Suggested:
          </span>
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="text-[11px] px-3 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-brand-500 text-slate-300 hover:text-white whitespace-nowrap transition-all"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about grades, study techniques, difficult topics, or exam stress..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="p-3 rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:opacity-50 text-white shadow-lg shadow-purple-600/20 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span>Powered by Gemini AI • Anonymized academic context</span>
            <span className="text-purple-400 font-medium">Empathetic & Evidence-Based Mentorship</span>
          </div>
        </div>
      </div>
    </div>
  );
};
