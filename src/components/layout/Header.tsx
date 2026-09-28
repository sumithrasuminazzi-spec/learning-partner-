import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  Sparkles,
  User,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your learning progress' },
  tutor: { title: 'AI Tutor', subtitle: 'Instant concept explanations & academic tutoring' },
  materials: { title: 'Study Materials', subtitle: 'Curated structured notes & high-yield revision' },
  quiz: { title: 'Quiz Generator', subtitle: 'Test retention with adaptive multiple-choice questions' },
  flashcards: { title: 'Flashcards', subtitle: 'Active recall spaced repetition system' },
  planner: { title: 'Study Planner', subtitle: 'Personalized timetable & daily academic roadmaps' },
  notes: { title: 'Ask From Notes', subtitle: 'Upload or paste lecture notes for targeted synthesis' },
  history: { title: 'Study History', subtitle: 'Archive of past chats, materials, and quizzes' },
  settings: { title: 'Settings', subtitle: 'Preferences, learning levels, and app configuration' },
};

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, setIsMobileMenuOpen, profile, updateProfile } = useApp();

  const currentMeta = TAB_TITLES[activeTab] || { title: 'EduGenie', subtitle: 'Your AI Learning Companion' };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
        {/* Left: Mobile menu toggle + Page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {currentMeta.title}
              {activeTab === 'tutor' && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick actions, Theme toggle, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Learning Level Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{profile.learningLevel}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => updateProfile({ darkMode: !profile.darkMode })}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={profile.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {profile.darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* User Profile Pill */}
          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">
              {profile.name}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
