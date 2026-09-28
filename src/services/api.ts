import {
  StudyMaterial,
  QuizData,
  Flashcard,
  StudyPlan,
  LearningRecommendation,
} from '../types';

export async function askTutor(params: {
  question: string;
  context?: string;
  history?: Array<{ role: string; content: string }>;
  learningLevel?: string;
  answerStyle?: string;
}): Promise<string> {
  const res = await fetch('/qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to get answer from EduGenie AI Tutor.');
  }

  const data = await res.json();
  return data.answer || data.response || 'No answer received.';
}

export async function generateStudyMaterial(params: {
  topic: string;
  subject?: string;
  difficulty?: string;
  learningLevel?: string;
}): Promise<StudyMaterial> {
  const res = await fetch('/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate study materials.');
  }

  return await res.json();
}

export async function generateQuiz(params: {
  topic: string;
  subject?: string;
  material?: string;
  numQuestions?: number;
  difficulty?: string;
}): Promise<QuizData> {
  const res = await fetch('/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate quiz.');
  }

  const data = await res.json();
  return {
    topic: data.topic || params.topic,
    subject: data.subject || params.subject || 'General',
    difficulty: data.difficulty || params.difficulty || 'Intermediate',
    totalQuestions: data.totalQuestions || (data.questions ? data.questions.length : 0),
    questions: data.questions || data.quiz || [],
  };
}

export async function generateFlashcards(params: {
  topic: string;
  subject?: string;
  material?: string;
  count?: number;
}): Promise<{ topic: string; subject: string; flashcards: Flashcard[] }> {
  const res = await fetch('/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate flashcards.');
  }

  return await res.json();
}

export async function generateStudyPlan(params: {
  subjects: string[];
  topics?: string;
  availableHoursPerDay?: number;
  targetDate?: string;
  priority?: string;
}): Promise<StudyPlan> {
  const res = await fetch('/study-planner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create study plan.');
  }

  const data = await res.json();
  return {
    ...data,
    createdAt: new Date().toISOString(),
  };
}

export async function getLearningRecommendations(params: {
  subject?: string;
  topic?: string;
  learningLevel?: string;
}): Promise<LearningRecommendation> {
  const res = await fetch('/learn/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to retrieve learning recommendations.');
  }

  return await res.json();
}

export async function analyzeNotes(params: {
  notes: string;
  action: 'qa' | 'summarize' | 'extract_points';
  question?: string;
}): Promise<any> {
  const res = await fetch('/notes/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to process notes.');
  }

  return await res.json();
}
