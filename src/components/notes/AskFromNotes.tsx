import React, { useState, useRef } from 'react';
import {
  FileText,
  Sparkles,
  UploadCloud,
  HelpCircle,
  ListOrdered,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  Send,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { analyzeNotes } from '../../services/api';
import { MarkdownView } from '../common/MarkdownView';

export const AskFromNotes: React.FC = () => {
  const { setActiveTab, setPreloadedNoteText } = useApp();

  const [notesText, setNotesText] = useState('');
  const [activeTab, setActiveTabState] = useState<'qa' | 'summarize' | 'extract'>('qa');
  const [question, setQuestion] = useState('');

  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setNotesText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleProcessAction = async (action: 'qa' | 'summarize' | 'extract') => {
    if (!notesText.trim()) {
      setErrorMsg('Please paste or upload study notes first.');
      return;
    }

    if (action === 'qa' && !question.trim()) {
      setErrorMsg('Please enter a question to ask about your notes.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await analyzeNotes({
        notes: notesText.trim(),
        action: action === 'extract' ? 'extract_points' : action,
        question: question.trim(),
      });

      setResult(res);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to process notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferToQuiz = () => {
    if (!notesText.trim()) return;
    setPreloadedNoteText(notesText);
    setActiveTab('quiz');
  };

  const handleTransferToFlashcards = () => {
    if (!notesText.trim()) return;
    setPreloadedNoteText(notesText);
    setActiveTab('flashcards');
  };

  const handleCopyResult = () => {
    if (!result) return;
    const textToCopy = typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = notesText.trim() ? notesText.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* 1. NOTES INPUT SECTION */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Ask From Notes & Lecture Slides</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Paste your raw notes or upload text files. EduGenie answers strictly grounded in your provided material.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.text"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <UploadCloud className="w-4 h-4 text-indigo-600" />
              <span>Upload .txt/.md</span>
            </button>
            {notesText && (
              <button
                onClick={() => setNotesText('')}
                className="px-2.5 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            rows={7}
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Paste your lecture notes, article excerpts, textbook chapters, or summary sheets here..."
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pt-1">
            <span>EduGenie prioritizes this context when reasoning</span>
            <span>{wordCount} words • {notesText.length} chars</span>
          </div>
        </div>

        {/* Note Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTabState('qa')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'qa'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Ask Question</span>
            </button>

            <button
              onClick={() => setActiveTabState('summarize')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'summarize'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Summarize</span>
            </button>

            <button
              onClick={() => setActiveTabState('extract')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'extract'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Extract Key Points</span>
            </button>
          </div>

          {/* Quick jump to Quiz or Flashcards */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTransferToQuiz}
              disabled={!notesText.trim()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 border border-violet-200 dark:border-violet-900 disabled:opacity-50 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Make Quiz</span>
            </button>

            <button
              onClick={handleTransferToFlashcards}
              disabled={!notesText.trim()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 border border-amber-200 dark:border-amber-900 disabled:opacity-50 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Make Flashcards</span>
            </button>
          </div>
        </div>

        {/* Action input: Question field for 'qa' */}
        {activeTab === 'qa' && (
          <div className="pt-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleProcessAction('qa');
                }}
                placeholder="Ask anything specific about these notes..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleProcessAction('qa')}
                disabled={isLoading || !question.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shrink-0 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </div>
          </div>
        )}

        {/* Direct trigger button for Summarize or Extract */}
        {activeTab !== 'qa' && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleProcessAction(activeTab)}
              disabled={isLoading || !notesText.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{activeTab === 'summarize' ? 'Generate Summary' : 'Extract Definitions & Points'}</span>
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}
      </div>

      {/* 2. LOADING STATE */}
      {isLoading && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto animate-spin" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 animate-pulse">
            EduGenie is analyzing your notes...
          </p>
        </div>
      )}

      {/* 3. RESULT VIEW */}
      {result && !isLoading && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold text-xs flex items-center justify-center">
                ✓
              </span>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Analysis Results
              </h4>
            </div>

            <button
              onClick={handleCopyResult}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* QA Output */}
          {result.type === 'qa' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                Q: {question}
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <MarkdownView content={result.result || ''} />
              </div>
            </div>
          )}

          {/* Summarize Output */}
          {result.type === 'summarize' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Executive Summary
                </h5>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {result.result?.summary || result.result}
                </p>
              </div>

              {result.result?.bulletPoints && result.result.bulletPoints.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Key Bullet Points
                  </h5>
                  <div className="space-y-1.5">
                    {result.result.bulletPoints.map((pt: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Extract Key Points Output */}
          {result.type === 'extract_points' && (
            <div className="space-y-5">
              {result.result?.keyPoints && result.result.keyPoints.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    High-Yield Concepts
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.result.keyPoints.map((pt: string, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
                        • {pt}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.result?.definitions && result.result.definitions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Extracted Definitions
                  </h5>
                  <div className="space-y-2">
                    {result.result.definitions.map((def: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                        <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">{def.term}</strong>
                        <p className="text-slate-600 dark:text-slate-300">{def.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
