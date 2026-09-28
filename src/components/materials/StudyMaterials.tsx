import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Bookmark,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileCheck,
  GraduationCap,
  Layers,
  HelpCircle,
  Lightbulb,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateStudyMaterial } from '../../services/api';
import { StudyMaterial } from '../../types';
import { MarkdownView } from '../common/MarkdownView';

const SUBJECT_OPTIONS = [
  'Computer Science',
  'Mathematics',
  'Biology',
  'Physics',
  'Chemistry',
  'World History',
  'Economics',
  'Psychology',
  'Philosophy',
  'Literature',
];

export const StudyMaterials: React.FC = () => {
  const { profile, addHistoryItem, activeHistoryDetail } = useApp();

  const [subject, setSubject] = useState('Computer Science');
  const [topic, setTopic] = useState('Binary Search Trees');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(profile.defaultDifficulty);
  const [learningLevel, setLearningLevel] = useState(profile.learningLevel);

  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Collapsible state for important questions
  const [openQuestions, setOpenQuestions] = useState<Record<number, boolean>>({});

  // Check if opened from history
  useEffect(() => {
    if (activeHistoryDetail && activeHistoryDetail.type === 'materials' && activeHistoryDetail.data) {
      setMaterial(activeHistoryDetail.data);
      if (activeHistoryDetail.data.subject) setSubject(activeHistoryDetail.data.subject);
      if (activeHistoryDetail.data.topic) setTopic(activeHistoryDetail.data.topic);
    }
  }, [activeHistoryDetail]);

  const toggleQuestion = (index: number) => {
    setOpenQuestions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrorMsg('Please specify a topic to generate materials.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setIsSaved(false);

    try {
      const data = await generateStudyMaterial({
        topic: topic.trim(),
        subject,
        difficulty,
        learningLevel,
      });

      setMaterial(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong while generating study material.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!material) return;
    addHistoryItem({
      type: 'materials',
      title: material.topic,
      subtitle: `${material.subject} • ${material.learningLevel} • ${material.difficulty}`,
      data: material,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopyAll = () => {
    if (!material) return;
    const textToCopy = `# ${material.topic} (${material.subject})\n\n## Overview\n${material.overview}\n\n## Key Concepts\n${material.keyConcepts?.map((c) => `* **${c.title}**: ${c.description}`).join('\n')}\n\n## Summary\n${material.summary}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Control Panel / Inputs */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Generate Comprehensive Study Notes</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Produce clear, textbook-quality revision notes with definitions, key principles, examples, and practice questions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Subject Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Binary Search Trees, Mitosis"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Difficulty Field */}
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

          {/* Learning Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Level
            </label>
            <select
              value={learningLevel}
              onChange={(e) => setLearningLevel(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Middle School">Middle School</option>
              <option value="High School">High School</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Graduate">Graduate</option>
              <option value="Self-learner">Self-learner</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-md transition-all
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
                <span>EduGenie is generating notes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Study Material</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Content Display */}
      {material && (
        <div className="space-y-6">
          {/* Top Material Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {material.subject}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                  {material.difficulty}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {material.learningLevel}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {material.topic}
              </h3>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Copy note text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors"
              >
                {isSaved ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Bookmark className="w-4 h-4" />}
                <span>{isSaved ? 'Saved to History' : 'Save Material'}</span>
              </button>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Generate Again</span>
              </button>
            </div>
          </div>

          {/* 1. Overview */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span>Conceptual Overview</span>
            </h4>
            <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              <MarkdownView content={material.overview} />
            </div>
          </div>

          {/* 2. Key Concepts */}
          {material.keyConcepts && material.keyConcepts.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Key Concepts & Principles</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {material.keyConcepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60"
                  >
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span>{concept.title}</span>
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {concept.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Definitions & Important Points (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Definitions */}
            {material.definitions && material.definitions.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
                <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  <span>Key Definitions</span>
                </h4>
                <div className="space-y-2.5">
                  {material.definitions.map((def, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700"
                    >
                      <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 block mb-0.5">
                        {def.term}
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {def.meaning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Points */}
            {material.importantPoints && material.importantPoints.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
                <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  <span>Important Takeaways & High-Yield Points</span>
                </h4>
                <div className="space-y-2">
                  {material.importantPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Examples & Real-World Scenarios */}
          {material.examples && material.examples.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Practical Examples & Step-by-Step Breakdown</span>
              </h4>
              <div className="space-y-3.5">
                {material.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-2"
                  >
                    <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                      Scenario / Problem {idx + 1}:
                    </div>
                    <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {ex.scenario}
                    </div>
                    <div className="pt-2 border-t border-indigo-100/60 dark:border-indigo-900/40 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <strong className="text-indigo-700 dark:text-indigo-400">Solution breakdown: </strong>
                      {ex.solution}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Summary */}
          {material.summary && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-50/60 to-violet-50/60 dark:from-slate-800/80 dark:to-slate-800/60 border border-indigo-100 dark:border-slate-700 space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Summary Recap
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {material.summary}
              </p>
            </div>
          )}

          {/* 6. Important Questions & Model Answers */}
          {material.importantQuestions && material.importantQuestions.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>Important Exam & Revision Questions</span>
              </h4>
              <div className="space-y-3">
                {material.importantQuestions.map((q, idx) => {
                  const isOpen = !!openQuestions[idx];
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50/50 dark:bg-slate-800/40"
                    >
                      <button
                        onClick={() => toggleQuestion(idx)}
                        className="w-full text-left p-4 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">Q{idx + 1}.</span>
                          <span>{q.question}</span>
                        </span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 leading-relaxed">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                            Model Answer:
                          </span>
                          {q.sampleAnswer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
