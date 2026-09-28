import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  BookOpen,
  CheckCircle2,
  Layers,
  CalendarDays,
  ArrowRight,
  TrendingUp,
  Clock,
  Award,
  Zap,
  Flame,
  ChevronRight,
  Atom,
  Binary,
  Calculator,
  Dna,
  Globe2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getLearningRecommendations } from '../../services/api';
import { LearningRecommendation } from '../../types';

export const Dashboard: React.FC = () => {
  const {
    profile,
    setActiveTab,
    setTutorPreloadQuestion,
    history,
    openHistoryDetail,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Computer Science');
  const [recommendations, setRecommendations] = useState<LearningRecommendation | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Time-based dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Handle direct Ask AI submit from search bar
  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setTutorPreloadQuestion(searchQuery.trim());
    setActiveTab('tutor');
  };

  // Load learning path recommendations for selected subject
  useEffect(() => {
    let isCurrent = true;
    setLoadingRecs(true);
    getLearningRecommendations({
      subject: selectedSubject,
      topic: 'Core Foundations',
      learningLevel: profile.learningLevel,
    })
      .then((data) => {
        if (isCurrent) {
          setRecommendations(data);
          setLoadingRecs(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching recs:', err);
        if (isCurrent) setLoadingRecs(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedSubject, profile.learningLevel]);

  // Frequently studied subjects
  const frequentSubjects = [
    { name: 'Computer Science', icon: Binary, count: '14 topics', color: 'from-blue-500 to-indigo-600' },
    { name: 'Mathematics', icon: Calculator, count: '9 topics', color: 'from-violet-500 to-purple-600' },
    { name: 'Biology', icon: Dna, count: '11 topics', color: 'from-emerald-500 to-teal-600' },
    { name: 'Physics', icon: Atom, count: '8 topics', color: 'from-amber-500 to-orange-600' },
    { name: 'World History', icon: Globe2, count: '6 topics', color: 'from-rose-500 to-pink-600' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-800 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-violet-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>EduGenie 3.0 • Powered by Gemini AI</span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {getGreeting()}, {profile.name} 👋
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base mt-1">
              What would you like to learn today?
            </p>
          </div>

          {/* Large AI Search Input */}
          <form onSubmit={handleAskSubmit} className="pt-2">
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-2xl transition-all focus-within:ring-4 focus-within:ring-white/30">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask EduGenie anything about your studies... (e.g. explain quantum superposition, calculus limits)"
                className="w-full pl-4 pr-32 py-3 bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm sm:text-base focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Ask AI</span>
              </button>
            </div>
          </form>

          {/* Prompt chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-indigo-100">
            <span className="opacity-75">Try asking:</span>
            {[
              "Why do cells use ATP?",
              "Explain Dijkstra's Algorithm",
              "How to solve 2nd order ODEs?",
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setTutorPreloadQuestion(chip);
                  setActiveTab('tutor');
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/10 truncate max-w-[240px]"
              >
                "{chip}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Quick Actions</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Everything you need to master your subjects</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Ask AI */}
          <button
            onClick={() => setActiveTab('tutor')}
            className="flex flex-col text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>AI Tutor</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              Ask questions and understand complex concepts with step-by-step guidance.
            </p>
          </button>

          {/* Study Materials */}
          <button
            onClick={() => setActiveTab('materials')}
            className="flex flex-col text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Study Materials</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              Generate structured learning notes with definitions, key points, and examples.
            </p>
          </button>

          {/* Create Quiz */}
          <button
            onClick={() => setActiveTab('quiz')}
            className="flex flex-col text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Create Quiz</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              Test your knowledge with adaptive AI-generated multiple-choice questions.
            </p>
          </button>

          {/* Flashcards */}
          <button
            onClick={() => setActiveTab('flashcards')}
            className="flex flex-col text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Flashcards</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              Revise important terms and formulas quickly with 3D interactive flip cards.
            </p>
          </button>

          {/* Study Planner */}
          <button
            onClick={() => setActiveTab('planner')}
            className="flex flex-col text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Study Planner</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              Create a personalized, neuro-friendly timetable to smash upcoming exams.
            </p>
          </button>
        </div>
      </div>

      {/* 3. STATS & PROGRESS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">5 Days</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Study Streak 🔥 Keep it up!</div>
          </div>
        </div>

        {/* Study Hours */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">14.5 hrs</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Study Time This Week</div>
          </div>
        </div>

        {/* Quiz Performance */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">88% Avg</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Quiz Accuracy (12 Quizzes)</div>
          </div>
        </div>

        {/* Completion */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-extrabold text-slate-900 dark:text-white">92%</span>
              <span className="text-slate-500">Weekly Goal</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full w-[92%]" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECOMMENDED LEARNING PATH (Requirement #16) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Recommended Learning Path</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI-structured progressive syllabus from fundamentals to mastery
            </p>
          </div>

          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['Computer Science', 'Mathematics', 'Biology', 'Physics'].map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedSubject === sub
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {loadingRecs ? (
          <div className="py-8 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400 animate-pulse gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
            <span>EduGenie is tailoring your roadmap for {selectedSubject}...</span>
          </div>
        ) : recommendations?.path ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {recommendations.path.map((step) => (
              <div
                key={step.stepNumber}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {step.stepNumber}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {step.stepTitle.replace(/^\d+\.\s*/, '')}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2.5 line-clamp-2">
                  {step.summary}
                </p>
                <div className="space-y-1">
                  {step.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* 5. TWO-COLUMN: RECENT ACTIVITY & FREQUENT SUBJECTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Recent Activity</span>
            </h3>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {history.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => openHistoryDetail(item)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                    {item.type === 'materials' && <BookOpen className="w-4 h-4" />}
                    {item.type === 'quiz' && <CheckCircle2 className="w-4 h-4" />}
                    {item.type === 'planner' && <CalendarDays className="w-4 h-4" />}
                    {item.type === 'flashcards' && <Layers className="w-4 h-4" />}
                    {item.type === 'tutor' && <Bot className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {item.subtitle || new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Frequently Studied Subjects (1 Col) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Study Subjects</span>
            </h3>
          </div>

          <div className="space-y-2">
            {frequentSubjects.map((sub) => {
              const SubIcon = sub.icon;
              return (
                <div
                  key={sub.name}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${sub.color} text-white flex items-center justify-center shrink-0`}>
                      <SubIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{sub.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{sub.count}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setTutorPreloadQuestion(`Teach me key concepts in ${sub.name}`);
                      setActiveTab('tutor');
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                  >
                    Study
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
