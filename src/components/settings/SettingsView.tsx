import React, { useState } from 'react';
import {
  Settings,
  User,
  Moon,
  Sun,
  GraduationCap,
  Sparkles,
  Database,
  Trash2,
  Download,
  Check,
  Shield,
  HeartHandshake,
  Star,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, history, clearAllHistory, setActiveTab } = useApp();

  const [name, setName] = useState(profile.name);
  const [learningLevel, setLearningLevel] = useState(profile.learningLevel);
  const [defaultDifficulty, setDefaultDifficulty] = useState(profile.defaultDifficulty);
  const [answerStyle, setAnswerStyle] = useState(profile.answerStyle);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || 'Student',
      learningLevel,
      defaultDifficulty,
      answerStyle,
    });
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleExportData = () => {
    const dataToExport = {
      profile,
      history,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edugenie-study-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] dark:border-pink-950/40 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#3D313A] dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#F8A8C4]" />
            <span>Preferences & Settings</span>
          </h2>
          <p className="text-xs text-[#766874] dark:text-pink-200/70 mt-0.5">
            Configure your student persona, learning difficulty, AI explanation depth, and appearance.
          </p>
        </div>

        {showSavedToast && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF2F6] text-[#C85D83] text-xs font-bold border border-[#FCE7F0] animate-fade-in">
            <Check className="w-4 h-4" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* 1. PROFILE SECTION */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] dark:border-pink-950/40 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#C85D83] flex items-center gap-2">
            <User className="w-4 h-4 text-[#F8A8C4]" />
            <span>Student Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D313A] dark:text-pink-100 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9FB] dark:bg-pink-950/20 border border-[#FCE7F0] text-sm text-[#3D313A] dark:text-pink-100 focus:outline-none focus:ring-2 focus:ring-[#F8A8C4]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D313A] dark:text-pink-100 mb-1.5">
                Academic Level
              </label>
              <select
                value={learningLevel}
                onChange={(e) => setLearningLevel(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9FB] dark:bg-pink-950/20 border border-[#FCE7F0] text-sm text-[#3D313A] dark:text-pink-100 focus:outline-none focus:ring-2 focus:ring-[#F8A8C4]/40"
              >
                <option value="Middle School">Middle School</option>
                <option value="High School">High School</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Graduate">Graduate</option>
                <option value="Self-learner">Self-learner</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. APPEARANCE SECTION */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] dark:border-pink-950/40 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#7C3AED] flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#C4B5FD]" />
            <span>Appearance & Theme</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateProfile({ darkMode: false })}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                !profile.darkMode
                  ? 'border-[#F8A8C4] bg-[#FEF2F6] ring-2 ring-[#F8A8C4]/20'
                  : 'border-[#FCE7F0] dark:border-pink-900/40 hover:bg-[#FFF9FB] dark:hover:bg-pink-950/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#3D313A] dark:text-white">Light Mode</div>
                  <div className="text-[11px] text-[#766874]">Soft pastel & radiant aesthetic</div>
                </div>
              </div>
              {!profile.darkMode && <Check className="w-4 h-4 text-[#C85D83]" />}
            </button>

            <button
              type="button"
              onClick={() => updateProfile({ darkMode: true })}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                profile.darkMode
                  ? 'border-[#C4B5FD] bg-[#1A131F] ring-2 ring-[#C4B5FD]/20'
                  : 'border-[#FCE7F0] dark:border-pink-900/40 hover:bg-[#FFF9FB] dark:hover:bg-pink-950/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#3D313A] dark:text-white">Dark Mode</div>
                  <div className="text-[11px] text-[#766874]">Gentle night-time contrast</div>
                </div>
              </div>
              {profile.darkMode && <Check className="w-4 h-4 text-[#C4B5FD]" />}
            </button>
          </div>
        </div>

        {/* 3. AI TUTORING & EXPLANATION DEPTH */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] dark:border-pink-950/40 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#D96B43] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FDBA9A]" />
            <span>AI Tutoring & Explanation Style</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#3D313A] dark:text-pink-100 mb-1.5">
                Default Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDefaultDifficulty(lvl)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      defaultDifficulty === lvl
                        ? 'bg-gradient-to-r from-[#F8A8C4] to-[#C4B5FD] text-white shadow-xs'
                        : 'bg-[#FFF9FB] text-[#766874] border border-[#FCE7F0] hover:bg-[#FEF2F6]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D313A] dark:text-pink-100 mb-1.5">
                Preferred Explanation Structure
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  'Short answers',
                  'Detailed answers',
                  'Step-by-step explanations',
                ].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setAnswerStyle(style as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      answerStyle === style
                        ? 'border-[#F8A8C4] bg-[#FEF2F6] ring-2 ring-[#F8A8C4]/20'
                        : 'border-[#FCE7F0] hover:bg-[#FFF9FB]'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#3D313A] dark:text-white flex items-center justify-between">
                      <span>{style}</span>
                      {answerStyle === style && <Check className="w-3.5 h-3.5 text-[#C85D83]" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#F8A8C4] via-[#EFA3C0] to-[#C4B5FD] hover:opacity-95 text-white font-bold text-xs shadow-sm shadow-pink-200 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* 4. FEEDBACK & COMMUNITY SECTION */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FEF2F6] via-[#F8F5FF] to-[#FFF7F2] border border-[#FCE7F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[#F8A8C4]" />
            <h3 className="font-bold text-sm text-[#3D313A] dark:text-white">
              Student Feedback & Suggestions
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#C85D83] border border-[#FCE7F0]">
              1-5 Stars ★
            </span>
          </div>
          <p className="text-xs text-[#766874] dark:text-pink-200/70 max-w-md">
            Rate your study experience, suggest new tools, or report issues directly to help us make EduGenie even more magical!
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('feedback')}
          className="px-5 py-2.5 rounded-2xl bg-white dark:bg-[#1E1622] hover:bg-[#FEF2F6] text-[#C85D83] font-bold text-xs border border-[#FCE7F0] shadow-2xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer shrink-0"
        >
          <Star className="w-3.5 h-3.5 fill-[#F8A8C4] text-[#F8A8C4]" />
          <span>Give Feedback</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5. DATA & STORAGE MANAGEMENT */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] dark:border-pink-950/40 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#C85D83] flex items-center gap-2">
          <Database className="w-4 h-4 text-[#F8A8C4]" />
          <span>Data & Local Storage</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFF9FB] dark:bg-pink-950/20 border border-[#FCE7F0]">
          <div>
            <div className="font-bold text-sm text-[#3D313A] dark:text-white">Export Study Data</div>
            <div className="text-xs text-[#766874] dark:text-pink-200/70">
              Download your full study history, quiz scores, and settings as a JSON archive.
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#766874] bg-white dark:bg-slate-700 border border-[#FCE7F0] hover:bg-[#FEF2F6] transition-colors shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#F8A8C4]" />
            <span>Export JSON</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60">
          <div>
            <div className="font-bold text-sm text-rose-700 dark:text-rose-300">Clear History Archive</div>
            <div className="text-xs text-[#766874] dark:text-pink-200/70">
              Permanently wipe all past chat messages, generated notes, and quiz performance metrics.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your full history?')) {
                clearAllHistory();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
