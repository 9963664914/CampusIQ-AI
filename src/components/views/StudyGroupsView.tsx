import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  MessageSquare,
  FileText,
  Calendar,
  CheckCircle,
  Share2,
  Send,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { StudyGroup, AppView } from '../../types';
import { api } from '../../services/api';

interface StudyGroupsViewProps {
  onNavigate: (view: AppView) => void;
}

export const StudyGroupsView: React.FC<StudyGroupsViewProps> = ({ onNavigate }) => {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Group Form
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSubject, setNewGroupSubject] = useState('Data Structures & Algorithms');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupSchedule, setNewGroupSchedule] = useState('Wednesdays 6:00 PM');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const res = await api.getStudyGroups();
      setGroups(res);
      if (res.length > 0 && !selectedGroup) {
        setSelectedGroup(res[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleJoin = async (groupId: string) => {
    try {
      const res = await api.toggleGroupMembership(groupId);
      if (res.group) {
        setGroups((prev) => prev.map((g) => (g.id === groupId ? res.group : g)));
        if (selectedGroup?.id === groupId) {
          setSelectedGroup(res.group);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !messageInput.trim()) return;

    try {
      const res = await api.postGroupMessage(selectedGroup.id, messageInput, 'Alex Rivera');
      if (res.message) {
        const updated = {
          ...selectedGroup,
          discussions: [...selectedGroup.discussions, res.message]
        };
        setSelectedGroup(updated);
        setGroups((prev) => prev.map((g) => (g.id === selectedGroup.id ? updated : g)));
        setMessageInput('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const res = await api.createStudyGroup({
        name: newGroupName,
        subject: newGroupSubject,
        description: newGroupDesc,
        meetingSchedule: newGroupSchedule
      });
      if (res.group) {
        setGroups((prev) => [res.group, ...prev]);
        setSelectedGroup(res.group);
        setShowCreateModal(false);
        setNewGroupName('');
        setNewGroupDesc('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white">Peer Learning & Collaborative Study Pods</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              Feature 12
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Connect with classmates with matching academic goals, share verified revision notes, and solve problem sets together.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Study Pod</span>
        </button>
      </div>

      {/* 2. GROUPS DISCOVERY & ACTIVE POD WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Group Cards (1 col) */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Available Study Groups ({groups.length})
          </div>

          {groups.map((group) => {
            const isSelected = selectedGroup?.id === group.id;
            return (
              <div
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-slate-900 border-brand-500 shadow-xl shadow-brand-500/10'
                    : 'glass-card border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{group.name}</h4>
                    <p className="text-[11px] text-brand-300 font-medium">{group.subject}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {group.membersCount} / {group.maxMembers}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{group.description}</p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400">{group.meetingSchedule.split('(')[0]}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleJoin(group.id);
                    }}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                      group.isMember
                        ? 'bg-slate-800 text-slate-300 hover:bg-rose-950 hover:text-rose-300'
                        : 'bg-brand-600 text-white hover:bg-brand-500'
                    }`}
                  >
                    {group.isMember ? 'Joined' : '+ Join Pod'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Pod Workspace (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedGroup && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              {/* Pod Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{selectedGroup.name}</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {selectedGroup.subject}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedGroup.description}</p>
                  <p className="text-xs text-accent-cyan mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Next Session: {selectedGroup.meetingSchedule}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleJoin(selectedGroup.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                    selectedGroup.isMember
                      ? 'bg-slate-800 text-slate-300 hover:bg-rose-950 hover:text-rose-300'
                      : 'bg-brand-600 text-white hover:bg-brand-500'
                  }`}
                >
                  {selectedGroup.isMember ? 'Leave Pod' : 'Join This Pod'}
                </button>
              </div>

              {/* Shared Resources */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent-cyan" />
                  <span>Shared Learning Notes & Repositories</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedGroup.resources.map((res, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{res.title}</div>
                        <div className="text-[10px] text-slate-400">By {res.author} • {res.type}</div>
                      </div>
                      <span className="text-[11px] text-brand-400 bg-brand-950 px-2 py-1 rounded">
                        View
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discussions & Live Chat Stream */}
              <div className="space-y-4 pt-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-accent-purple" />
                  <span>Pod Discussions ({selectedGroup.discussions.length})</span>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {selectedGroup.discussions.map((d) => (
                    <div key={d.id} className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-200">{d.author}</span>
                        <span className="text-slate-400 font-mono text-[10px]">{d.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-300">{d.message}</p>
                    </div>
                  ))}
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Share an insight or ask a question to your study pod..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-600/30"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE POD MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1628] border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Create Peer Study Pod</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Study Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems Lab Prep"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Subject Focus</label>
                <input
                  type="text"
                  required
                  value={newGroupSubject}
                  onChange={(e) => setNewGroupSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Description & Goals</label>
                <textarea
                  rows={2}
                  required
                  placeholder="What will this group collaborate on?"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Weekly Meeting Slot</label>
                <input
                  type="text"
                  value={newGroupSchedule}
                  onChange={(e) => setNewGroupSchedule(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/30"
                >
                  Launch Pod
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
