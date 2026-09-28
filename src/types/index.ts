export type NavigationTab =
  | 'dashboard'
  | 'tutor'
  | 'materials'
  | 'quiz'
  | 'flashcards'
  | 'planner'
  | 'notes'
  | 'history'
  | 'settings';

export interface UserProfile {
  name: string;
  learningLevel: 'Middle School' | 'High School' | 'Undergraduate' | 'Graduate' | 'Self-learner';
  defaultDifficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  answerStyle: 'Short answers' | 'Detailed answers' | 'Step-by-step explanations';
  darkMode: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface KeyConcept {
  title: string;
  description: string;
}

export interface Definition {
  term: string;
  meaning: string;
}

export interface ExampleCase {
  scenario: string;
  solution: string;
}

export interface ImportantQuestion {
  question: string;
  sampleAnswer: string;
}

export interface StudyMaterial {
  id?: string;
  topic: string;
  subject: string;
  difficulty: string;
  learningLevel: string;
  overview: string;
  keyConcepts: KeyConcept[];
  definitions: Definition[];
  importantPoints: string[];
  examples: ExampleCase[];
  summary: string;
  importantQuestions: ImportantQuestion[];
  generatedAt?: string;
  rawText?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface QuizData {
  id?: string;
  topic: string;
  subject: string;
  difficulty: string;
  totalQuestions: number;
  questions: QuizQuestion[];
}

export interface QuizResult {
  id: string;
  topic: string;
  subject: string;
  score: number;
  total: number;
  percentage: number;
  questions: QuizQuestion[];
  userAnswers: Record<number, string>;
  completedAt: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
}

export interface FlashcardDeck {
  id?: string;
  topic: string;
  subject: string;
  cards: Flashcard[];
}

export interface StudyPlanTask {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  priority: 'High' | 'Medium' | 'Low';
  tips?: string;
  completed: boolean;
}

export interface StudyPlanDay {
  dayName: string;
  focus: string;
  tasks: StudyPlanTask[];
}

export interface StudyPlan {
  id?: string;
  title: string;
  totalEstimatedHours: number;
  dailyTargetHours: number;
  overallStrategy: string;
  days: StudyPlanDay[];
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  type: 'tutor' | 'materials' | 'quiz' | 'flashcards' | 'planner';
  title: string;
  subtitle?: string;
  date: string;
  data: any;
}

export interface RecommendationStep {
  stepNumber: number;
  stepTitle: string;
  summary: string;
  items: string[];
}

export interface LearningRecommendation {
  subject: string;
  topic: string;
  targetLevel?: string;
  path: RecommendationStep[];
  rawRecommendation?: string;
}
