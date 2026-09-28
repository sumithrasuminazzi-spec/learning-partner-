import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  NavigationTab,
  UserProfile,
  HistoryItem,
} from '../types';

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'date'>) => void;
  deleteHistoryItem: (id: string) => void;
  clearAllHistory: () => void;
  tutorPreloadQuestion: string | null;
  setTutorPreloadQuestion: (q: string | null) => void;
  preloadedNoteText: string | null;
  setPreloadedNoteText: (text: string | null) => void;
  activeHistoryDetail: HistoryItem | null;
  openHistoryDetail: (item: HistoryItem) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Student',
  learningLevel: 'Undergraduate',
  defaultDifficulty: 'Intermediate',
  answerStyle: 'Detailed answers',
  darkMode: false,
};

const SEED_HISTORY: HistoryItem[] = [
  {
    id: 'seed-1',
    type: 'materials',
    title: 'Photosynthesis & Light-Dependent Reactions',
    subtitle: 'Biology • Undergraduate • 4 Concepts',
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    data: {
      topic: 'Photosynthesis & Light-Dependent Reactions',
      subject: 'Biology',
      difficulty: 'Intermediate',
      learningLevel: 'Undergraduate',
      overview: 'Photosynthesis is the fundamental biological process that converts light energy into chemical energy stored in glucose. The light-dependent reactions take place within the thylakoid membranes of chloroplasts, using light energy to produce ATP and NADPH while releasing oxygen.',
      keyConcepts: [
        { title: 'Photosystem II & Photolysis', description: 'Light photons excite electrons in chlorophyll P680, causing water molecules to split and release O2.' },
        { title: 'Electron Transport Chain (ETC)', description: 'Excited electrons pass through plastoquinone and cytochrome b6f, pumping protons into the thylakoid lumen.' },
        { title: 'ATP Synthase & Chemiosmosis', description: 'The electrochemical proton gradient drives ATP synthase to phosphorylate ADP into ATP.' },
      ],
      definitions: [
        { term: 'Photolysis', meaning: 'The chemical decomposition of water induced by light photons during photosystem II activation.' },
        { term: 'Chemiosmosis', meaning: 'The movement of ions across a semipermeable membrane down their electrochemical gradient to generate ATP.' },
      ],
      importantPoints: [
        'Water split in PSII is the source of all atmospheric O2 produced in photosynthesis.',
        'ATP and NADPH produced here are essential fuel for the Calvin Cycle (dark reactions).',
      ],
      examples: [
        { scenario: 'Cyanobacteria bloom in lake with intense sunlight', solution: 'Increased solar irradiance boosts PSII electron excitation and O2 saturation, rapidly powering primary carbohydrate synthesis.' }
      ],
      summary: 'Light reactions harness photons to generate high-energy ATP and NADPH via electron transport and photolysis, setting the stage for sugar synthesis in the stroma.',
      importantQuestions: [
        { question: 'What is the primary electron donor for the light-dependent reactions?', sampleAnswer: 'Water (H2O), which undergoes photolysis in Photosystem II to release electrons, protons, and oxygen gas.' }
      ]
    },
  },
  {
    id: 'seed-2',
    type: 'quiz',
    title: 'Data Structures: Binary Search Trees',
    subtitle: 'Computer Science • Score: 4/5 (80%)',
    date: new Date(Date.now() - 3600000 * 20).toISOString(),
    data: {
      topic: 'Binary Search Trees',
      subject: 'Computer Science',
      difficulty: 'Intermediate',
      totalQuestions: 5,
      questions: [
        {
          id: 'q1',
          question: 'What is the average time complexity of searching a node in a balanced Binary Search Tree?',
          options: ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'],
          answer: 'O(log n)',
          explanation: 'In a balanced BST, each comparison eliminates half the remaining subtree, yielding logarithmic time.'
        }
      ]
    }
  },
  {
    id: 'seed-3',
    type: 'planner',
    title: '7-Day Midterm Revision Plan',
    subtitle: 'Calculus & Physics • 3.5 hrs/day',
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
    data: {
      title: '7-Day Midterm Revision Plan',
      totalEstimatedHours: 24,
      dailyTargetHours: 3.5,
      overallStrategy: 'Alternate between rigorous math derivations and conceptual physics applications to prevent cognitive fatigue.',
      days: [
        {
          dayName: 'Day 1 (Monday)',
          focus: 'Derivatives & Kinematics',
          tasks: [
            { id: 't1', subject: 'Calculus', topic: 'Chain Rule & Implicit Differentiation', durationMinutes: 60, priority: 'High', completed: true, tips: 'Practice trigonometric chain rule combinations.' },
            { id: 't2', subject: 'Physics', topic: 'Rotational Dynamics & Torque', durationMinutes: 60, priority: 'High', completed: true, tips: 'Draw free-body diagrams for rolling objects.' },
          ]
        }
      ]
    }
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const [tutorPreloadQuestion, setTutorPreloadQuestion] = useState<string | null>(null);
  const [preloadedNoteText, setPreloadedNoteText] = useState<string | null>(null);
  const [activeHistoryDetail, setActiveHistoryDetail] = useState<HistoryItem | null>(null);

  // Profile with localStorage persistence
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('edugenie_user_profile');
      if (stored) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PROFILE;
  });

  // History with localStorage persistence
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('edugenie_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return SEED_HISTORY;
  });

  // Sync dark mode class with profile.darkMode
  useEffect(() => {
    if (profile.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.darkMode]);

  // Persist profile
  useEffect(() => {
    try {
      localStorage.setItem('edugenie_user_profile', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem('edugenie_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const addHistoryItem = (item: Omit<HistoryItem, 'id' | 'date'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString(),
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllHistory = () => {
    setHistory([]);
  };

  const openHistoryDetail = (item: HistoryItem) => {
    setActiveHistoryDetail(item);
    if (item.type === 'materials') setActiveTab('materials');
    else if (item.type === 'quiz') setActiveTab('quiz');
    else if (item.type === 'planner') setActiveTab('planner');
    else if (item.type === 'flashcards') setActiveTab('flashcards');
    else if (item.type === 'tutor') setActiveTab('tutor');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        profile,
        updateProfile,
        history,
        addHistoryItem,
        deleteHistoryItem,
        clearAllHistory,
        tutorPreloadQuestion,
        setTutorPreloadQuestion,
        preloadedNoteText,
        setPreloadedNoteText,
        activeHistoryDetail,
        openHistoryDetail,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
