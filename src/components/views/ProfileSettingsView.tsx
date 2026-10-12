import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  User,
  Bell,
  Lock,
  Download,
  CheckCircle2,
  Save,
  Key
} from 'lucide-react';
import { CurrentUser, AppView } from '../../types';
import { api } from '../../services/api';

interface ProfileSettingsViewProps {
  currentUser: CurrentUser;
  onNavigate: (view: AppView) => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [privacySettings, setPrivacySettings] = useState<any>({
    dataRetentionMonths: 24,
    anonymizeInAggregates: true,
    parentSharingConsent: true,
    enableAIPersonalization: true,
    lmsTelemetryTracking: true,
  });
  const [savedNotice, setSavedNotice] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'security'>('privacy');

  useEffect(() => {
    loadPrivacy();
  }, []);

  const loadPrivacy = async () => {
    try {
      const res = await api.getPrivacySettings();
      setPrivacySettings(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = (key: string) => {
    setPrivacySettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      await api.updatePrivacySettings(privacySettings);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportData = () => {
    const studentData = {
      user: currentUser,
      privacySettings,
      exportedAt: new Date().toISOString()
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(studentData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentUser.name.replace(' ', '_')}_profile_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-800 text-slate-200">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white">Profile, Privacy & Security Settings</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal credentials, data sharing consent, and FERPA governance options.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'profile' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'privacy' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Privacy Controls
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'security' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Security
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Preferences updated and synchronized to your account!</span>
        </div>
      )}

      {/* 2. TAB: PRIVACY CONTROLS */}
      {activeTab === 'privacy' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">FERPA & Student Privacy Controls</h3>
              <p className="text-xs text-slate-400">
                You maintain complete granular consent over how your academic data is computed and shared.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs text-slate-200"
            >
              <Download className="w-3.5 h-3.5 text-brand-400" />
              <span>Export My Data</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white">Anonymize in Aggregate Institutional Research</h4>
                <p className="text-[11px] text-slate-400">
                  Strip personally identifiable information before including your grades in department averages.
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.anonymizeInAggregates}
                onChange={() => handleToggle('anonymizeInAggregates')}
                className="w-5 h-5 accent-brand-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white">Parent / Guardian Portal Sync</h4>
                <p className="text-[11px] text-slate-400">
                  Allow linked parents or guardians to view semester progress summaries and verified attendance.
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.parentSharingConsent}
                onChange={() => handleToggle('parentSharingConsent')}
                className="w-5 h-5 accent-brand-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white">Adaptive AI Personalization Engine</h4>
                <p className="text-[11px] text-slate-400">
                  Permit Gemini AI to customize study schedules and question recommendations using historical quiz errors.
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.enableAIPersonalization}
                onChange={() => handleToggle('enableAIPersonalization')}
                className="w-5 h-5 accent-brand-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white">LMS Engagement Telemetry Tracking</h4>
                <p className="text-[11px] text-slate-400">
                  Record study portal active hours to generate weekly study radar charts.
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.lmsTelemetryTracking}
                onChange={() => handleToggle('lmsTelemetryTracking')}
                className="w-5 h-5 accent-brand-500 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Privacy Preferences</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. TAB: PROFILE DETAILS */}
      {activeTab === 'profile' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-brand-500/30 shadow-lg"
            />
            <div>
              <h3 className="text-lg font-bold text-white">{currentUser.name}</h3>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 inline-block mt-2">
                Active Persona: {currentUser.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Full Legal Name</label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Institutional Email</label>
              <input
                type="text"
                disabled
                value={currentUser.email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Department / Affiliation</label>
              <input
                type="text"
                disabled
                value={currentUser.department || 'Computer Science & Engineering'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Institutional ID</label>
              <input
                type="text"
                disabled
                value={currentUser.studentId || currentUser.id}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold text-xs">Biographical Notes</label>
            <p className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              {currentUser.bio || 'Active participant in the EduPulse AI predictive learning platform.'}
            </p>
          </div>
        </div>
      )}

      {/* 4. TAB: SECURITY */}
      {activeTab === 'security' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-base font-bold text-white">Authentication & Account Security</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</div>
              <p className="text-[11px] text-slate-400">Institutional SSO Authenticator via Duo / Google Authenticator active.</p>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded inline-block mt-1">
                Enforced by Campus IT
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-white">Encryption Standard</div>
              <p className="text-[11px] text-slate-400">All student records, predictions, and counselor chats are encrypted with AES-256 at rest and TLS 1.3 in transit.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white">Institutional Session Management</div>
                <p className="text-[11px] text-slate-400">Terminates active SSO session tokens and redirects to the Login Portal.</p>
              </div>
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all shrink-0"
              >
                Log Out & Switch Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
