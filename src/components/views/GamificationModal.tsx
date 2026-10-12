import React from 'react';
import {
  Award,
  Zap,
  CheckCircle2,
  Trophy,
  Flame,
  Clock,
  TrendingUp,
  Users,
  X,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Badge } from '../../types';

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: Badge[];
}

export const GamificationModal: React.FC<GamificationModalProps> = ({
  isOpen,
  onClose,
  badges,
}) => {
  if (!isOpen) return null;

  const handleCelebrateStreak = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'flame':
        return <Flame className="w-6 h-6 text-amber-400" />;
      case 'trophy':
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 'trending-up':
        return <TrendingUp className="w-6 h-6 text-emerald-400" />;
      case 'users':
        return <Users className="w-6 h-6 text-blue-400" />;
      case 'clock':
        return <Clock className="w-6 h-6 text-purple-400" />;
      default:
        return <Zap className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b1222] border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Gamification & Academic Milestones</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                  Feature 9
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Rewarding consistent effort, turnaround improvements, and peer collaboration.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Day Streak & XP Showcase Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-amber-950/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center ring-2 ring-amber-500/40">
              <Flame className="w-8 h-8 fill-amber-400 animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white">7-Day Study Streak!</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Completed scheduled AI study blocks 7 days in a row without interruption.
              </p>
            </div>
          </div>

          <button
            onClick={handleCelebrateStreak}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 shrink-0 transition-transform hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Celebrate Streak 🎉</span>
          </button>
        </div>

        {/* XP Level Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold">Level 4 Scholar (1,450 XP)</span>
            <span className="text-slate-400 font-mono">Next Level at 2,000 XP</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-500 to-accent-purple h-full rounded-full"
              style={{ width: '72.5%' }}
            ></div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Earned & In-Progress Badges ({badges.length})
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badges.map((badge) => {
              const isUnlocked = !!badge.unlockedAt;
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    isUnlocked
                      ? 'bg-slate-900/90 border-slate-700/80 shadow-md'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl shrink-0 ${
                      isUnlocked ? 'bg-slate-800 ring-1 ring-slate-700' : 'bg-slate-900'
                    }`}
                  >
                    {getBadgeIcon(badge.icon)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{badge.title}</h4>
                      {isUnlocked ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {badge.progressPercent}%
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{badge.description}</p>
                    {isUnlocked && (
                      <div className="text-[10px] text-slate-400 pt-1">Earned: {badge.unlockedAt}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
