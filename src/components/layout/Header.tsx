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
  dashboard: { title: 'Home', subtitle: 'Welcome back to your personalized study dashboard' },
  tutor: { title: 'AI Assistant', subtitle: 'Instant concept explanations & friendly academic tutoring' },
  materials: { title: 'Study Materials', subtitle: 'Curated structured notes & high-yield revision' },
  quiz: { title: 'Quizzes', subtitle: 'Test retention with adaptive multiple-choice questions' },
  flashcards: { title: 'Flashcards', subtitle: 'Active recall spaced repetition system' },
  planner: { title: 'Study Plan', subtitle: 'Personalized timetable & daily academic roadmaps' },
  notes: { title: 'Notes', subtitle: 'Upload or paste lecture notes for targeted synthesis' },
  history: { title: 'Progress & Activity', subtitle: 'Review your study journey, mastery scores, and streak' },
  feedback: { title: 'Feedback', subtitle: 'Share your thoughts, rating, and suggestions to make EduGenie even more magical' },
  settings: { title: 'Settings', subtitle: 'Preferences, learning levels, and app configuration' },
};

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, setIsMobileMenuOpen, profile, updateProfile } = useApp();

  const currentMeta = TAB_TITLES[activeTab] || { title: 'EduGenie', subtitle: 'Your AI Learning Companion' };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#1E1622]/90 backdrop-blur-md border-b border-[#FCE7F0] dark:border-pink-950/40 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
        {/* Left: Mobile menu toggle + Page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-1 text-[#766874] hover:text-[#3D313A] dark:hover:text-white rounded-xl hover:bg-[#FEF2F6] dark:hover:bg-slate-800 md:hidden cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#3D313A] dark:text-white flex items-center gap-2">
              {currentMeta.title}
              {activeTab === 'tutor' && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F8A8C4] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F8A8C4]"></span>
                </span>
              )}
            </h1>
            <p className="text-xs text-[#766874] dark:text-pink-200/60 hidden sm:block">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick actions, Theme toggle, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Learning Level Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F6] dark:bg-pink-950/60 border border-[#FCE7F0] text-[#C85D83] dark:text-pink-300 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-[#F8A8C4]" />
            <span>{profile.learningLevel}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => updateProfile({ darkMode: !profile.darkMode })}
            className="p-2 text-[#766874] hover:text-[#3D313A] dark:text-pink-200/70 dark:hover:text-white rounded-xl hover:bg-[#FEF2F6] dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={profile.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {profile.darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#766874]" />
            )}
          </button>

          {/* User Profile Pill */}
          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-[#FEF2F6] dark:hover:bg-slate-800 border border-[#FCE7F0] dark:border-pink-950/40 transition-colors shadow-2xs cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#F8A8C4] via-[#C4B5FD] to-[#FDBA9A] flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-[#3D313A] dark:text-pink-100 hidden sm:block">
              {profile.name}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
