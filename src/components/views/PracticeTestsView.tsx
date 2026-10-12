import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  HelpCircle,
  ArrowRight,
  Brain,
  Award,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, AppView } from '../../types';
import { api } from '../../services/api';

interface PracticeTestsViewProps {
  onNavigate: (view: AppView) => void;
  onOpenGamification: () => void;
}

export const PracticeTestsView: React.FC<PracticeTestsViewProps> = ({
  onNavigate,
  onOpenGamification,
}) => {
  const [subject, setSubject] = useState('Computer Networks');
  const [topic, setTopic] = useState('CIDR Subnetting & IP addressing');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState('3');

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [explainingIdx, setExplainingIdx] = useState<number | null>(null);

  // Generate initial test
  useEffect(() => {
    handleGenerateQuiz();
  }, []);

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setSubmitted(false);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setExplanations({});

    try {
      const res = await api.generateQuiz({
        subject,
        topic,
        difficulty,
        count: Number(questionCount)
      });
      if (res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitTest = () => {
    setSubmitted(true);
    // calculate score
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) correct++;
    });

    if (correct / questions.length >= 0.6) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleExplain = async (qIdx: number) => {
    const q = questions[qIdx];
    const chosen = selectedAnswers[qIdx] !== undefined ? q.options[selectedAnswers[qIdx]] : 'None';
    const correct = q.options[q.correctIndex];

    setExplainingIdx(qIdx);
    try {
      const res = await api.explainAnswer({
        question: q.question,
        chosenOption: chosen,
        correctOption: correct,
        explanation: q.explanation
      });
      setExplanations((prev) => ({ ...prev, [qIdx]: res.explanation }));
    } catch (e) {
      console.error(e);
    } finally {
      setExplainingIdx(null);
    }
  };

  const currentQ = questions[currentIndex];
  let score = 0;
  if (submitted) {
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) score++;
    });
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <BookOpenCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white">AI-Generated Practice Test Generator</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
              Feature 13
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic quiz generator with instantaneous answer evaluation, timer, and detailed cognitive breakdown of misconceptions.
          </p>
        </div>

        <button
          onClick={onOpenGamification}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold"
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Quiz XP Streak (+50 XP)</span>
        </button>
      </div>

      {/* 2. QUIZ GENERATOR CONFIGURATION BAR */}
      <div className="glass-card p-5 rounded-3xl border border-slate-800 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[11px] text-slate-400 font-semibold block mb-1">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
          >
            <option value="Computer Networks">Computer Networks & Security</option>
            <option value="Database Management Systems">Database Management Systems</option>
            <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
            <option value="Machine Learning Foundations">Machine Learning Foundations</option>
            <option value="Linear Algebra">Linear Algebra & Optimization</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-[11px] text-slate-400 font-semibold block mb-1">Topic Focus</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
            placeholder="e.g. CIDR Subnetting or BCNF"
          />
        </div>

        <div className="w-32">
          <label className="text-[11px] text-slate-400 font-semibold block mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="self-end pt-1">
          <button
            onClick={handleGenerateQuiz}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/30 flex items-center gap-2 transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Generating...' : 'Generate New Quiz'}</span>
          </button>
        </div>
      </div>

      {/* 3. INTERACTIVE QUIZ TAKING ENVIRONMENT */}
      {questions.length > 0 && currentQ && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          {/* Question Meta Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-brand-400 bg-brand-950 px-2 py-0.5 rounded border border-brand-800">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentQ.subject} • {currentQ.topic}
              </span>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {currentQ.difficulty} Difficulty
            </span>
          </div>

          {/* Question Text */}
          <div className="text-base sm:text-lg font-semibold text-white leading-relaxed">
            {currentQ.question}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentIndex] === optIdx;
              const isCorrect = currentQ.correctIndex === optIdx;

              let style = 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200';
              if (isSelected && !submitted) {
                style = 'bg-brand-600/20 border-brand-500 text-white font-medium ring-1 ring-brand-500';
              }
              if (submitted) {
                if (isCorrect) {
                  style = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-medium';
                } else if (isSelected && !isCorrect) {
                  style = 'bg-rose-500/20 border-rose-500 text-rose-200 font-medium';
                }
              }

              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(currentIndex, optIdx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800/80 text-slate-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="text-xs leading-relaxed">{option}</span>
                  </div>

                  {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Explanation if submitted */}
          {submitted && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-accent-cyan" />
                  Conceptual Explanation:
                </span>
                <button
                  onClick={() => handleExplain(currentIndex)}
                  disabled={explainingIdx === currentIndex}
                  className="text-[11px] text-accent-cyan hover:underline flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{explainingIdx === currentIndex ? 'Analyzing...' : 'Deep Dive Misconception Analysis'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{currentQ.explanation}</p>

              {explanations[currentIndex] && (
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 whitespace-pre-wrap leading-relaxed mt-2">
                  {explanations[currentIndex]}
                </div>
              )}
            </div>
          )}

          {/* Navigation & Submit Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-900 text-xs text-slate-300 disabled:opacity-40"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                    currentIndex === idx
                      ? 'bg-brand-600 text-white'
                      : selectedAnswers[idx] !== undefined
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl bg-brand-600 text-xs text-white font-semibold"
              >
                Next
              </button>
            ) : (
              !submitted && (
                <button
                  onClick={handleSubmitTest}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20"
                >
                  Submit Quiz
                </button>
              )
            )}
          </div>

          {/* Test Completion Summary */}
          {submitted && (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase font-bold text-slate-400">Diagnostic Score</div>
                <div className="text-2xl font-black text-white mt-1">
                  {score} / {questions.length} Correct ({Math.round((score / questions.length) * 100)}%)
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {score === questions.length
                    ? '🎉 Flawless performance! Mastery badge unlocked.'
                    : 'Targeted revision recommended for identified missed questions.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerateQuiz}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-xs text-slate-200 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake with New Questions</span>
                </button>
                <button
                  onClick={() => onNavigate('study_planner')}
                  className="px-4 py-2.5 rounded-xl bg-brand-600 text-xs text-white font-semibold"
                >
                  Schedule Revision Block
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
