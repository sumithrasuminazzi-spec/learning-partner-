import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Trophy,
  AlertCircle,
  Check,
  X,
  HelpCircle,
  FileText,
  Bookmark,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateQuiz } from '../../services/api';
import { QuizData, QuizQuestion, QuizResult } from '../../types';

export const QuizGenerator: React.FC = () => {
  const { profile, addHistoryItem, activeHistoryDetail, preloadedNoteText, setPreloadedNoteText } = useApp();

  // Generator inputs
  const [topic, setTopic] = useState('Binary Search Trees');
  const [subject, setSubject] = useState('Computer Science');
  const [material, setMaterial] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(profile.defaultDifficulty);

  // Quiz state
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check preloaded note context
  useEffect(() => {
    if (preloadedNoteText) {
      setMaterial(preloadedNoteText);
      setTopic('Study Notes Quiz');
      setPreloadedNoteText(null);
    }
  }, [preloadedNoteText]);

  // Check if opened from history
  useEffect(() => {
    if (activeHistoryDetail && activeHistoryDetail.type === 'quiz' && activeHistoryDetail.data) {
      const data = activeHistoryDetail.data;
      if (data.questions) {
        setQuizData(data);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setIsCompleted(false);
        setQuizResult(null);
      }
    }
  }, [activeHistoryDetail]);

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      setErrorMsg('Please specify a topic or subject for the quiz.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setIsCompleted(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setQuizResult(null);

    try {
      const result = await generateQuiz({
        topic: topic.trim(),
        subject: subject.trim(),
        material: material.trim(),
        numQuestions,
        difficulty,
      });

      if (!result.questions || result.questions.length === 0) {
        throw new Error('No valid questions could be generated. Please try again.');
      }

      setQuizData(result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong while generating the quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (option: string) => {
    if (isCompleted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: option,
    }));
  };

  const handleNext = () => {
    if (!quizData) return;
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleCompleteQuiz();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleCompleteQuiz = () => {
    if (!quizData) return;

    let score = 0;
    quizData.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        score++;
      }
    });

    const total = quizData.questions.length;
    const percentage = Math.round((score / total) * 100);

    const result: QuizResult = {
      id: `result-${Date.now()}`,
      topic: quizData.topic,
      subject: quizData.subject,
      score,
      total,
      percentage,
      questions: quizData.questions,
      userAnswers: selectedAnswers,
      completedAt: new Date().toISOString(),
    };

    setQuizResult(result);
    setIsCompleted(true);

    // Save to study history
    addHistoryItem({
      type: 'quiz',
      title: `${quizData.topic} Quiz`,
      subtitle: `${quizData.subject} • Score: ${score}/${total} (${percentage}%)`,
      data: quizData,
    });
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
    setQuizResult(null);
  };

  const currentQ = quizData?.questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQ = quizData?.questions.length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* 1. QUIZ GENERATION FORM */}
      {!quizData && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>AI Quiz Generator</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create interactive multiple-choice quizzes tailored to your topic or study notes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Topic / Concept
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, Binary Search Trees"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Science, Biology"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Optional Reference Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Optional Study Material or Text (for custom quiz generation)</span>
              <span className="text-[11px] font-normal text-slate-400">Optional</span>
            </label>
            <textarea
              rows={3}
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="Paste relevant textbook excerpts, lecture slides, or revision notes here..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Questions:</span>
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNumQuestions(num)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    numQuestions === num
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={isLoading || !topic.trim()}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all
                ${
                  isLoading || !topic.trim()
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 hover:scale-[1.01]'
                }
              `}
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Generating Quiz...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Start Quiz</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}
        </div>
      )}

      {/* 2. INTERACTIVE QUIZ CARD PLAYER */}
      {quizData && !isCompleted && currentQ && (
        <div className="space-y-6">
          {/* Quiz Top bar: Progress, Topic, Reset */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                {quizData.subject} • {quizData.difficulty}
              </span>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {quizData.topic}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Question {currentQuestionIndex + 1} of {totalQ}
              </span>
              <button
                onClick={() => setQuizData(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
              >
                Change Topic
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQ) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                Question {currentQuestionIndex + 1}
              </span>
              <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question}
              </h4>
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === option;
                const letter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className={`flex items-center gap-3.5 p-4 rounded-2xl border text-left text-sm font-semibold transition-all group
                      ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200'
                      }
                    `}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors
                        ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 group-hover:bg-slate-100'
                        }
                      `}
                    >
                      {letter}
                    </div>
                    <span className="flex-1 leading-snug">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors
                  ${
                    currentQuestionIndex === 0
                      ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!selectedAnswers[currentQuestionIndex]}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all
                  ${
                    !selectedAnswers[currentQuestionIndex]
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                  }
                `}
              >
                <span>{currentQuestionIndex === totalQ - 1 ? 'Submit Quiz' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. QUIZ COMPLETED SCREEN */}
      {isCompleted && quizResult && (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Quiz Completed!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Topic: <strong className="text-slate-800 dark:text-slate-200">{quizResult.topic}</strong>
              </p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto pt-2">
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900">
                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {quizResult.percentage}%
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Percentage
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900">
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {quizResult.score} / {quizResult.total}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Total Score
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900">
                <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
                  {quizResult.score}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Correct
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900">
                <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                  {quizResult.total - quizResult.score}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Incorrect
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={handleRetake}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>

              <button
                onClick={() => setQuizData(null)}
                className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors"
              >
                Create New Quiz
              </button>
            </div>
          </div>

          {/* Breakdown & Explanations */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Question-by-Question Review</span>
            </h4>

            <div className="space-y-4">
              {quizResult.questions.map((q, idx) => {
                const userChoice = quizResult.userAnswers[idx];
                const isCorrect = userChoice === q.answer;

                return (
                  <div
                    key={q.id || idx}
                    className={`p-4 rounded-2xl border text-sm space-y-3 ${
                      isCorrect
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        <span className="text-slate-400 mr-1.5">Q{idx + 1}.</span>
                        {q.question}
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1 ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Correct</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5" />
                            <span>Incorrect</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 block mb-0.5">Your Answer:</span>
                        <span className={isCorrect ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                          {userChoice || 'Skipped'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 block mb-0.5">Correct Answer:</span>
                        <span className="text-emerald-600 font-bold">{q.answer}</span>
                      </div>
                    </div>

                    {q.explanation && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 leading-relaxed">
                        <strong className="text-slate-900 dark:text-slate-200">Explanation: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
