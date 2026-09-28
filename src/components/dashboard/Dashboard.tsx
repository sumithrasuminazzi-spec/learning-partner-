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
  Play,
  Heart,
  FileText,
  Star,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getLearningRecommendations } from '../../services/api';
import { LearningRecommendation, RecommendationStep } from '../../types';

// Canonical 6 stages required for academic learning paths
const DEFAULT_STAGE_DEFINITIONS = [
  {
    stepNumber: 1,
    stageName: 'Beginner Concepts',
    tag: 'Foundations',
    defaultSummary: 'Groundwork definitions, fundamental vocabulary, and core mathematical notation.',
    defaultItems: ['Prerequisites & Scope', 'Core Vocabulary & Principles', 'Introductory Examples'],
  },
  {
    stepNumber: 2,
    stageName: 'Core Concepts',
    tag: 'Theory',
    defaultSummary: 'Governing theorems, canonical models, and essential problem-solving frameworks.',
    defaultItems: ['Primary Theoretical Models', 'Canonical Governing Rules', 'Standard Calculations'],
  },
  {
    stepNumber: 3,
    stageName: 'Practice',
    tag: 'Application',
    defaultSummary: 'Active recall problem sets, concept-checking drills, and diagnostic quizzes.',
    defaultItems: ['End-of-chapter Problem Sets', 'Interactive Flashcard Drills', 'Timed Diagnostic Quizzes'],
  },
  {
    stepNumber: 4,
    stageName: 'Intermediate Concepts',
    tag: 'Synthesis',
    defaultSummary: 'Multi-step system patterns, edge cases, and cross-domain practical applications.',
    defaultItems: ['Complex Multi-step Systems', 'Edge-case Analysis', 'Domain Intersections'],
  },
  {
    stepNumber: 5,
    stageName: 'Advanced Topics',
    tag: 'Mastery',
    defaultSummary: 'Specialized frameworks, boundary scaling, and contemporary academic research questions.',
    defaultItems: ['Specialized Implementations', 'Advanced Proofs & Scaling', 'Industry Paradigms'],
  },
  {
    stepNumber: 6,
    stageName: 'Recommended Resources',
    tag: 'References',
    defaultSummary: 'Curated university textbooks, open courseware lecture series, and visual sandbox tools.',
    defaultItems: ['Standard Reference Textbook', 'OpenCourseWare Video Series', 'Interactive Visual Sandbox'],
  },
];

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

  // Subject cards with progress indicators using the 3 theme colors: Blush Pink (#F8A8C4), Soft Lavender (#C4B5FD), Peach (#FDBA9A)
  const subjectCards = [
    {
      name: 'Computer Science',
      icon: Binary,
      topicsCount: 14,
      progress: 82,
      lastActive: 'Today',
      color: 'from-[#F8A8C4] to-[#C4B5FD]',
      bgTint: 'bg-[#FEF2F6]',
      borderTint: 'border-[#FCE7F0]',
      barColor: 'bg-gradient-to-r from-[#F8A8C4] to-[#C4B5FD]',
      badgeColor: 'text-[#C85D83] bg-pink-50',
    },
    {
      name: 'Mathematics',
      icon: Calculator,
      topicsCount: 9,
      progress: 70,
      lastActive: 'Yesterday',
      color: 'from-[#C4B5FD] to-[#FDBA9A]',
      bgTint: 'bg-[#F8F5FF]',
      borderTint: 'border-[#EFEAFE]',
      barColor: 'bg-gradient-to-r from-[#C4B5FD] to-[#FDBA9A]',
      badgeColor: 'text-[#7C3AED] bg-purple-50',
    },
    {
      name: 'Biology',
      icon: Dna,
      topicsCount: 11,
      progress: 64,
      lastActive: '2 days ago',
      color: 'from-[#FDBA9A] to-[#F8A8C4]',
      bgTint: 'bg-[#FFF7F2]',
      borderTint: 'border-[#FCE9DE]',
      barColor: 'bg-gradient-to-r from-[#FDBA9A] to-[#F8A8C4]',
      badgeColor: 'text-[#D96B43] bg-orange-50',
    },
    {
      name: 'Physics',
      icon: Atom,
      topicsCount: 8,
      progress: 55,
      lastActive: '3 days ago',
      color: 'from-[#F8A8C4] via-[#C4B5FD] to-[#FDBA9A]',
      bgTint: 'bg-[#FEF2F6]',
      borderTint: 'border-[#FCE7F0]',
      barColor: 'bg-gradient-to-r from-[#F8A8C4] to-[#C4B5FD]',
      badgeColor: 'text-[#C85D83] bg-pink-50',
    },
  ];

  // Continue Learning in-progress modules
  const continueModules = [
    {
      subject: 'Computer Science',
      topic: 'Binary Search Trees & Balancing Algorithms',
      chapter: 'Chapter 4 • Data Structures',
      progress: 78,
      timeSpent: '2.5 hrs',
      icon: Binary,
      color: 'bg-[#F8A8C4]',
      badge: 'Resume Chapter',
      actionPrompt: 'Explain how AVL tree rotations keep search trees balanced with step-by-step illustrations',
    },
    {
      subject: 'Biology',
      topic: 'Cellular Respiration & the Krebs Cycle',
      chapter: 'Module 3 • Bioenergetics',
      progress: 62,
      timeSpent: '1.8 hrs',
      icon: Dna,
      color: 'bg-[#C4B5FD]',
      badge: 'Review Notes',
      actionPrompt: 'Summarize the stages of cellular respiration, net ATP yield, and key enzyme checkpoints',
    },
    {
      subject: 'Mathematics',
      topic: 'Calculus: Integration by Parts & Partial Fractions',
      chapter: 'Unit 5 • Advanced Integration',
      progress: 90,
      timeSpent: '3.2 hrs',
      icon: Calculator,
      color: 'bg-[#FDBA9A]',
      badge: 'Practice Quiz',
      actionPrompt: 'Give me 3 practice problems on integration by parts with detailed worked solutions',
    },
  ];

  // Resolve the 6 separated stages from recommendations or standard defaults
  const resolvedStages = DEFAULT_STAGE_DEFINITIONS.map((def, idx) => {
    const apiStep = recommendations?.path?.[idx] as RecommendationStep | undefined;
    return {
      stepNumber: def.stepNumber,
      title: def.stageName,
      tag: def.tag,
      summary: apiStep?.summary || def.defaultSummary,
      items: apiStep?.items && apiStep.items.length > 0 ? apiStep.items.slice(0, 3) : def.defaultItems,
    };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-14">
      {/* 1. PERSONALIZED WELCOME & MOTIVATIONAL BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-[#1E1622]/90 border border-[#FCE7F0] dark:border-pink-950/40 shadow-xs backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🌸</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#3D313A] dark:text-white tracking-tight">
              Hi, {profile.name}!
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF2F6] text-[#C85D83] border border-[#FCE7F0]">
              <Sparkles className="w-3 h-3 text-[#F8A8C4]" />
              <span>{profile.learningLevel}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#766874] dark:text-pink-200/70">
            Ready to make learning magical today? You're on an awesome 5-day study streak!
          </p>
        </div>

        {/* Motivational pill */}
        <div className="flex items-center gap-2 self-start sm:self-center px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FEF2F6] via-[#F8F5FF] to-[#FFF7F2] border border-[#FCE7F0] shadow-2xs">
          <Heart className="w-4 h-4 text-[#F8A8C4] fill-[#F8A8C4] animate-pulse shrink-0" />
          <span className="text-xs font-semibold text-[#3D313A] dark:text-pink-200">
            "Small steps every day lead to giant leaps!" ✨
          </span>
        </div>
      </div>

      {/* 2. LARGE AI LEARNING ASSISTANT BANNER (Soft Pink - Lavender - Peach Gradient) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#F8A8C4] via-[#C4B5FD] to-[#FDBA9A] text-white p-7 sm:p-9 lg:p-10 shadow-lg shadow-pink-200/35 border border-white/50">
        {/* Soft decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 rounded-full bg-[#C4B5FD]/30 blur-2xl pointer-events-none" />
        <div className="absolute -top-10 left-10 w-40 h-40 rounded-full bg-[#FDBA9A]/30 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/35 backdrop-blur-md text-xs font-bold tracking-wide text-[#3D313A] border border-white/60 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>EduGenie AI Learning Assistant</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C85D83] animate-ping" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl lg:text-4xl font-extrabold tracking-tight text-[#3D313A] leading-tight">
              What would you love to learn today?
            </h1>
            <p className="text-[#3D313A]/90 text-xs sm:text-sm mt-1.5 font-medium max-w-2xl leading-relaxed">
              Ask anything across your courses — receive instant gentle explanations, interactive step derivations, and friendly academic guidance.
            </p>
          </div>

          {/* Prominent Search Bar */}
          <form onSubmit={handleAskSubmit} className="pt-2">
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-xl border border-white/90 transition-all focus-within:ring-4 focus-within:ring-[#F8A8C4]/40">
              <Search className="w-5 h-5 text-[#766874]/60 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask EduGenie anything... (e.g. explain photosynthesis, calculus limits, recursion)"
                className="w-full pl-3 pr-36 py-3.5 bg-transparent text-[#3D313A] placeholder:text-[#766874]/60 text-sm sm:text-base focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#F8A8C4] via-[#EFA3C0] to-[#C4B5FD] hover:opacity-95 text-white text-sm font-bold shadow-md shadow-pink-300/40 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Ask AI</span>
              </button>
            </div>
          </form>

          {/* Prompt chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#3D313A]">
            <span className="font-semibold opacity-90">✨ Popular prompts:</span>
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
                className="px-3 py-1 rounded-xl bg-white/45 hover:bg-white/70 transition-colors border border-white/60 truncate max-w-[240px] text-[#3D313A] font-semibold backdrop-blur-xs shadow-2xs cursor-pointer"
              >
                "{chip}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. STUDY PROGRESS & MOTIVATIONAL ELEMENTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] dark:border-pink-950/40 shadow-xs hover:shadow-md transition-all flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF2F6] text-[#C85D83] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Flame className="w-6 h-6 text-[#F8A8C4] fill-[#F8A8C4] animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#3D313A] dark:text-white tracking-tight">5 Days</div>
            <div className="text-xs text-[#766874] dark:text-pink-200/70 font-medium">Study Streak 🔥 Keep glowing!</div>
          </div>
        </div>

        {/* Study Hours */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#EFEAFE] dark:border-purple-950/40 shadow-xs hover:shadow-md transition-all flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-[#F8F5FF] text-[#7C3AED] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6 text-[#C4B5FD]" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#3D313A] dark:text-white tracking-tight">14.5 hrs</div>
            <div className="text-xs text-[#766874] dark:text-pink-200/70 font-medium">Study Time This Week ⏱️</div>
          </div>
        </div>

        {/* Quiz Performance */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE9DE] dark:border-orange-950/40 shadow-xs hover:shadow-md transition-all flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF7F2] text-[#D96B43] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Award className="w-6 h-6 text-[#FDBA9A]" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#3D313A] dark:text-white tracking-tight">88% Avg</div>
            <div className="text-xs text-[#766874] dark:text-pink-200/70 font-medium">Quiz Accuracy (12 Tests) 🏆</div>
          </div>
        </div>

        {/* Weekly Goal Progress */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] dark:border-pink-950/40 shadow-xs hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FEF2F6] to-[#F8F5FF] text-[#C85D83] flex items-center justify-center shrink-0 shadow-2xs">
            <TrendingUp className="w-6 h-6 text-[#F8A8C4]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-extrabold text-[#3D313A] dark:text-white text-base">92%</span>
              <span className="text-[10px] font-bold text-[#C85D83] bg-[#FEF2F6] px-2 py-0.5 rounded-full border border-[#FCE7F0]">
                On Track ✨
              </span>
            </div>
            <div className="w-full bg-[#FEF2F6] dark:bg-pink-950/40 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-[#F8A8C4] via-[#C4B5FD] to-[#FDBA9A] h-2.5 rounded-full w-[92%]" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. QUICK ACTIONS: Ask AI, Create Notes, Take a Quiz, Study Plan */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#3D313A] dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#F8A8C4]" />
              <span>Quick Actions</span>
            </h3>
            <p className="text-xs text-[#766874] dark:text-pink-200/70">
              Your favorite tools to learn, summarize, and practice
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Ask AI */}
          <button
            onClick={() => setActiveTab('tutor')}
            className="flex flex-col text-left p-5 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] dark:border-pink-950/40 shadow-xs hover:shadow-md hover:border-[#F8A8C4] hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FEF2F6] text-[#C85D83] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-2xs">
              <Bot className="w-5 h-5 text-[#F8A8C4]" />
            </div>
            <h4 className="font-bold text-sm text-[#3D313A] dark:text-white flex items-center justify-between group-hover:text-[#C85D83] transition-colors">
              <span>Ask AI</span>
              <ArrowRight className="w-4 h-4 text-[#766874]/50 group-hover:text-[#C85D83] group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-xs text-[#766874] dark:text-pink-200/70 mt-1 leading-relaxed line-clamp-2">
              Get instant concept explanations, derivations, and analogies.
            </p>
          </button>

          {/* Create Notes */}
          <button
            onClick={() => setActiveTab('materials')}
            className="flex flex-col text-left p-5 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#EFEAFE] dark:border-purple-950/40 shadow-xs hover:shadow-md hover:border-[#C4B5FD] hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#F8F5FF] text-[#7C3AED] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-2xs">
              <BookOpen className="w-5 h-5 text-[#C4B5FD]" />
            </div>
            <h4 className="font-bold text-sm text-[#3D313A] dark:text-white flex items-center justify-between group-hover:text-[#7C3AED] transition-colors">
              <span>Create Notes</span>
              <ArrowRight className="w-4 h-4 text-[#766874]/50 group-hover:text-[#7C3AED] group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-xs text-[#766874] dark:text-pink-200/70 mt-1 leading-relaxed line-clamp-2">
              Generate structured, high-yield study materials & key formulas.
            </p>
          </button>

          {/* Take a Quiz */}
          <button
            onClick={() => setActiveTab('quiz')}
            className="flex flex-col text-left p-5 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE9DE] dark:border-orange-950/40 shadow-xs hover:shadow-md hover:border-[#FDBA9A] hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FFF7F2] text-[#D96B43] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-[#FDBA9A]" />
            </div>
            <h4 className="font-bold text-sm text-[#3D313A] dark:text-white flex items-center justify-between group-hover:text-[#D96B43] transition-colors">
              <span>Take a Quiz</span>
              <ArrowRight className="w-4 h-4 text-[#766874]/50 group-hover:text-[#D96B43] group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-xs text-[#766874] dark:text-pink-200/70 mt-1 leading-relaxed line-clamp-2">
              Test your retention with adaptive multiple-choice diagnostic tests.
            </p>
          </button>

          {/* Study Plan */}
          <button
            onClick={() => setActiveTab('planner')}
            className="flex flex-col text-left p-5 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] dark:border-pink-950/40 shadow-xs hover:shadow-md hover:border-[#F8A8C4] hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FEF2F6] text-[#C85D83] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-2xs">
              <CalendarDays className="w-5 h-5 text-[#F8A8C4]" />
            </div>
            <h4 className="font-bold text-sm text-[#3D313A] dark:text-white flex items-center justify-between group-hover:text-[#C85D83] transition-colors">
              <span>Study Plan</span>
              <ArrowRight className="w-4 h-4 text-[#766874]/50 group-hover:text-[#C85D83] group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-xs text-[#766874] dark:text-pink-200/70 mt-1 leading-relaxed line-clamp-2">
              Design a personalized weekly timetable aligned with your exam targets.
            </p>
          </button>
        </div>
      </div>

      {/* 5. CONTINUE LEARNING SECTION */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#3D313A] dark:text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-[#F8A8C4] fill-[#F8A8C4]" />
              <span>Continue Learning</span>
            </h3>
            <p className="text-xs text-[#766874] dark:text-pink-200/70">
              Pick up right where you left off
            </p>
          </div>
          <button
            onClick={() => setActiveTab('materials')}
            className="text-xs font-semibold text-[#C85D83] hover:text-[#9A375A] flex items-center gap-1 cursor-pointer"
          >
            <span>All Materials</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {continueModules.map((item, idx) => {
            return (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] dark:border-pink-950/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF2F6] text-[#C85D83] border border-[#FCE7F0]">
                      {item.subject}
                    </span>
                    <span className="text-xs text-[#766874] font-medium">{item.timeSpent} spent</span>
                  </div>

                  <h4 className="font-bold text-sm text-[#3D313A] dark:text-white line-clamp-2 mb-1">
                    {item.topic}
                  </h4>
                  <p className="text-xs text-[#766874] dark:text-pink-200/70 mb-3.5">
                    {item.chapter}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#FCE7F0]/60">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#766874] font-medium">Progress</span>
                      <span className="font-bold text-[#3D313A] dark:text-white">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-[#FEF2F6] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#F8A8C4] via-[#C4B5FD] to-[#FDBA9A] h-2 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setTutorPreloadQuestion(item.actionPrompt);
                      setActiveTab('tutor');
                    }}
                    className="w-full py-2 px-3 rounded-2xl bg-gradient-to-r from-[#FEF2F6] to-[#F8F5FF] hover:from-[#F8A8C4]/20 hover:to-[#C4B5FD]/20 border border-[#FCE7F0] text-xs font-bold text-[#C85D83] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{item.badge}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. SUBJECT CARDS WITH PROGRESS INDICATORS */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#3D313A] dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C4B5FD]" />
              <span>Subject Overview</span>
            </h3>
            <p className="text-xs text-[#766874] dark:text-pink-200/70">
              Select a subject to explore its structured progressive curriculum
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjectCards.map((sub) => {
            const SubIcon = sub.icon;
            const isSelected = selectedSubject === sub.name;
            return (
              <div
                key={sub.name}
                onClick={() => setSelectedSubject(sub.name)}
                className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-white shadow-md border-[#F8A8C4] ring-2 ring-[#F8A8C4]/30'
                    : 'bg-white/80 dark:bg-[#1E1622] border-[#FCE7F0] hover:border-[#F8A8C4]/60 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${sub.color} text-white flex items-center justify-center shadow-xs`}>
                    <SubIcon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-current/20 ${sub.badgeColor}`}>
                    {sub.topicsCount} Topics
                  </span>
                </div>

                <h4 className="font-bold text-sm text-[#3D313A] dark:text-white mb-1">
                  {sub.name}
                </h4>
                <p className="text-xs text-[#766874] dark:text-pink-200/70 mb-3">
                  Active • Revised {sub.lastActive}
                </p>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#766874] font-medium">Mastery</span>
                    <span className="font-bold text-[#3D313A] dark:text-white">{sub.progress}%</span>
                  </div>
                  <div className="w-full bg-[#FEF2F6] dark:bg-pink-950/40 rounded-full h-2 overflow-hidden">
                    <div className={`${sub.barColor} h-2 rounded-full`} style={{ width: `${sub.progress}%` }} />
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-3 pt-2 border-t border-[#FCE7F0]/60 flex items-center justify-between text-[11px] font-semibold text-[#C85D83]">
                    <span>Viewing Curriculum</span>
                    <Star className="w-3.5 h-3.5 fill-[#F8A8C4] text-[#F8A8C4]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. RECOMMENDED LEARNING PATH - 6 Separated Stages */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] dark:border-pink-950/40 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#F8A8C4]" />
              <h3 className="text-lg font-bold text-[#3D313A] dark:text-white">
                Recommended Learning Path for {selectedSubject}
              </h3>
            </div>
            <p className="text-xs text-[#766874] dark:text-pink-200/70">
              AI-structured progressive syllabus from fundamentals to mastery
            </p>
          </div>

          {/* Quick Subject Pill Toggle */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['Computer Science', 'Mathematics', 'Biology', 'Physics'].map((sub) => {
              const isSelected = selectedSubject === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#F8A8C4] to-[#C4B5FD] text-white shadow-xs'
                      : 'bg-[#FEF2F6] text-[#766874] hover:text-[#3D313A] hover:bg-[#FCE7F0]'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>

        {loadingRecs ? (
          <div className="py-10 flex flex-col items-center justify-center text-sm text-[#766874] gap-2">
            <Sparkles className="w-5 h-5 text-[#F8A8C4] animate-spin" />
            <span className="font-medium animate-pulse">EduGenie is personalizing your 6-stage roadmap for {selectedSubject}...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resolvedStages.map((stage) => (
              <div
                key={stage.stepNumber}
                className="p-5 rounded-3xl bg-[#FFF9FB] dark:bg-pink-950/20 border border-[#FCE7F0]/80 dark:border-pink-900/40 hover:border-[#F8A8C4] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#F8A8C4] to-[#C4B5FD] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {stage.stepNumber}
                      </span>
                      <h4 className="font-bold text-sm text-[#3D313A] dark:text-white truncate">
                        {stage.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#C85D83] border border-[#FCE7F0]">
                      {stage.tag}
                    </span>
                  </div>

                  <p className="text-xs text-[#766874] dark:text-pink-200/70 leading-relaxed line-clamp-2 mb-3">
                    {stage.summary}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#FCE7F0]/60">
                  {stage.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[#3D313A] dark:text-pink-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F8A8C4] shrink-0" />
                      <span className="truncate font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8. TWO-COLUMN: RECENT ACTIVITY & QUICK REVISION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] dark:border-pink-950/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#3D313A] dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F8A8C4]" />
              <span>Recent Activity</span>
            </h3>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-semibold text-[#C85D83] hover:text-[#9A375A] flex items-center gap-1 cursor-pointer"
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
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9FB] dark:bg-pink-950/20 hover:bg-[#FEF2F6] dark:hover:bg-pink-950/40 border border-transparent hover:border-[#FCE7F0] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-2xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] flex items-center justify-center shrink-0 text-[#C85D83] shadow-2xs">
                    {item.type === 'materials' && <BookOpen className="w-4 h-4" />}
                    {item.type === 'quiz' && <CheckCircle2 className="w-4 h-4" />}
                    {item.type === 'planner' && <CalendarDays className="w-4 h-4" />}
                    {item.type === 'flashcards' && <Layers className="w-4 h-4" />}
                    {item.type === 'tutor' && <Bot className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-semibold text-sm text-[#3D313A] dark:text-white truncate group-hover:text-[#C85D83] transition-colors">
                      {item.title}
                    </h5>
                    <p className="text-xs text-[#766874] dark:text-pink-200/70 truncate">
                      {item.subtitle || new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-medium text-[#766874]/70 hidden sm:inline">
                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#766874]/50 group-hover:text-[#C85D83] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Curricula / Quick Revision (1 Col) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] dark:border-pink-950/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#3D313A] dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FDBA9A]" />
              <span>Quick Revision</span>
            </h3>
          </div>

          <div className="space-y-2">
            {[
              { name: 'Computer Science', icon: Binary, count: '14 topics', color: 'from-[#F8A8C4] to-[#C4B5FD]' },
              { name: 'Mathematics', icon: Calculator, count: '9 topics', color: 'from-[#C4B5FD] to-[#FDBA9A]' },
              { name: 'Biology', icon: Dna, count: '11 topics', color: 'from-[#FDBA9A] to-[#F8A8C4]' },
              { name: 'Physics', icon: Atom, count: '8 topics', color: 'from-[#F8A8C4] via-[#C4B5FD] to-[#FDBA9A]' },
              { name: 'World History', icon: Globe2, count: '6 topics', color: 'from-[#F8A8C4] to-[#FDBA9A]' },
            ].map((sub) => {
              const SubIcon = sub.icon;
              return (
                <div
                  key={sub.name}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#FFF9FB] dark:hover:bg-pink-950/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${sub.color} text-white flex items-center justify-center shrink-0 shadow-2xs`}>
                      <SubIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#3D313A] dark:text-white">{sub.name}</div>
                      <div className="text-[11px] text-[#766874] dark:text-pink-200/70">{sub.count}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setTutorPreloadQuestion(`Teach me key concepts in ${sub.name}`);
                      setActiveTab('tutor');
                    }}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-[#FEF2F6] dark:bg-pink-950/60 text-[#C85D83] hover:bg-[#F8A8C4] hover:text-white transition-all cursor-pointer shadow-2xs"
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
