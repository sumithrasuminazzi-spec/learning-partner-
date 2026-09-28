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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, history, clearAllHistory } = useApp();

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
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Preferences & Settings</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure your student persona, learning difficulty, AI explanation depth, and appearance.
          </p>
        </div>

        {showSavedToast && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800 animate-fade-in">
            <Check className="w-4 h-4" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* 1. PROFILE SECTION */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Student Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Academic Level
              </label>
              <select
                value={learningLevel}
                onChange={(e) => setLearningLevel(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <Sun className="w-4 h-4" />
            <span>Appearance & Theme</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateProfile({ darkMode: false })}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                !profile.darkMode
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Light Mode</div>
                  <div className="text-[11px] text-slate-500">Crisp, high-contrast study view</div>
                </div>
              </div>
              {!profile.darkMode && <Check className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              type="button"
              onClick={() => updateProfile({ darkMode: true })}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                profile.darkMode
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-indigo-300 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Dark Mode</div>
                  <div className="text-[11px] text-slate-500">Easy on the eyes for night study</div>
                </div>
              </div>
              {profile.darkMode && <Check className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </div>

        {/* 3. LEARNING PREFERENCES */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>Learning Difficulty & Defaults</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDefaultDifficulty(diff)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  defaultDifficulty === diff
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{diff}</span>
                  {defaultDifficulty === diff && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {diff === 'Beginner' && 'Foundational concepts and plain language'}
                  {diff === 'Intermediate' && 'Balanced textbook explanations'}
                  {diff === 'Advanced' && 'Rigorous mathematical and theoretical depth'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 4. AI EXPLANATION PREFERENCES */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>AI Tutor Response Style</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['Short answers', 'Detailed answers', 'Step-by-step explanations'] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setAnswerStyle(style)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  answerStyle === style
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{style}</span>
                  {answerStyle === style && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {style === 'Short answers' && 'Concise bullet points & executive summaries'}
                  {style === 'Detailed answers' && 'Comprehensive academic explanations'}
                  {style === 'Step-by-step explanations' && 'Structured guided derivations & walkthroughs'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01]"
          >
            Save All Preferences
          </button>
        </div>
      </form>

      {/* 5. DATA & STORAGE MANAGEMENT */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span>Data & Local Storage</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">Export Study Data</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Download your full study history, quiz scores, and settings as a JSON archive.
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60">
          <div>
            <div className="font-bold text-sm text-rose-700 dark:text-rose-300">Clear History Archive</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
