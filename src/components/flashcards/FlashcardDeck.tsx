import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Check,
  X,
  Bookmark,
  Shuffle,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateFlashcards } from '../../services/api';
import { Flashcard, FlashcardDeck as FlashcardDeckType } from '../../types';

export const FlashcardDeck: React.FC = () => {
  const { profile, addHistoryItem, activeHistoryDetail, preloadedNoteText, setPreloadedNoteText } = useApp();

  const [topic, setTopic] = useState('Photosynthesis & Cellular Respiration');
  const [subject, setSubject] = useState('Biology');
  const [material, setMaterial] = useState('');
  const [cardCount, setCardCount] = useState(8);

  const [deck, setDeck] = useState<FlashcardDeckType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check preloaded note text
  useEffect(() => {
    if (preloadedNoteText) {
      setMaterial(preloadedNoteText);
      setTopic('Notes Flashcards');
      setPreloadedNoteText(null);
    }
  }, [preloadedNoteText]);

  // Check if opened from history
  useEffect(() => {
    if (activeHistoryDetail && activeHistoryDetail.type === 'flashcards' && activeHistoryDetail.data) {
      const data = activeHistoryDetail.data;
      if (data.cards) {
        setDeck(data);
        setCurrentIndex(0);
        setIsFlipped(false);
        setMasteredIds(new Set());
        setReviewIds(new Set());
      }
    }
  }, [activeHistoryDetail]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrorMsg('Please specify a topic or subject for the flashcards.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setIsFlipped(false);
    setCurrentIndex(0);
    setMasteredIds(new Set());
    setReviewIds(new Set());

    try {
      const result = await generateFlashcards({
        topic: topic.trim(),
        subject: subject.trim(),
        material: material.trim(),
        count: cardCount,
      });

      if (!result.flashcards || result.flashcards.length === 0) {
        throw new Error('No flashcards could be generated. Please try again.');
      }

      const newDeck: FlashcardDeckType = {
        topic: result.topic,
        subject: result.subject,
        cards: result.flashcards,
      };

      setDeck(newDeck);

      // Save to history
      addHistoryItem({
        type: 'flashcards',
        title: `${result.topic} Flashcards`,
        subtitle: `${result.subject} • ${result.flashcards.length} Cards`,
        data: newDeck,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong while generating flashcards.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = () => {
    if (!deck) return;
    setIsFlipped(false);
    if (currentIndex < deck.cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!deck) return;
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleMarkMastered = () => {
    if (!deck) return;
    const currentCard = deck.cards[currentIndex];
    setMasteredIds((prev) => new Set(prev).add(currentCard.id));
    setReviewIds((prev) => {
      const copy = new Set(prev);
      copy.delete(currentCard.id);
      return copy;
    });
    handleNext();
  };

  const handleMarkReview = () => {
    if (!deck) return;
    const currentCard = deck.cards[currentIndex];
    setReviewIds((prev) => new Set(prev).add(currentCard.id));
    setMasteredIds((prev) => {
      const copy = new Set(prev);
      copy.delete(currentCard.id);
      return copy;
    });
    handleNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleShuffle = () => {
    if (!deck) return;
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    setDeck({ ...deck, cards: shuffled });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const currentCard = deck?.cards[currentIndex];
  const totalCards = deck?.cards.length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* 1. FLASHCARD GENERATOR FORM */}
      {!deck && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>AI Flashcards Generator</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create high-yield active recall flashcards to memorize definitions, concepts, and formulas effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Topic / Concept
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, Newton's Laws"
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
                placeholder="e.g. Biology, Physics, History"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Optional material text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Optional Study Notes / Text excerpt</span>
              <span className="text-[11px] font-normal text-slate-400">Optional</span>
            </label>
            <textarea
              rows={3}
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="Paste specific definitions or notes to turn into flashcards..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Card Count:</span>
              {[6, 8, 12].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setCardCount(cnt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    cardCount === cnt
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cnt} Cards
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
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
                  <span>Generating Cards...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Flashcards</span>
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

      {/* 2. INTERACTIVE FLASHCARD PLAYER */}
      {deck && currentCard && (
        <div className="space-y-6">
          {/* Top Header */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                {deck.subject} Flashcards
              </span>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {deck.topic}
              </h3>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Card {currentIndex + 1} of {totalCards}
              </span>

              <button
                onClick={handleShuffle}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Shuffle Deck"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={() => setDeck(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
              >
                New Deck
              </button>
            </div>
          </div>

          {/* Progress Bar & Mastery Stats */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Mastered: {masteredIds.size}
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                Needs Review: {reviewIds.size}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
              />
            </div>
          </div>

          {/* 3D FLIP CARD AREA */}
          <div className="perspective-1000 w-full min-h-[340px] cursor-pointer" onClick={handleFlip}>
            <div
              className={`relative w-full min-h-[340px] rounded-3xl transition-transform duration-500 transform-style-preserve-3d shadow-md
                ${isFlipped ? 'rotate-y-180' : ''}
              `}
            >
              {/* FRONT (QUESTION) */}
              <div className="absolute inset-0 backface-hidden p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-slate-800 flex flex-col justify-between select-none">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Question / Prompt
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Click to flip</span>
                  </span>
                </div>

                <div className="my-auto py-6 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                    {currentCard.question}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span>Card {currentIndex + 1} of {totalCards}</span>
                  {currentCard.hint && (
                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Hint: {currentCard.hint}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* BACK (ANSWER) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 p-8 sm:p-10 rounded-3xl bg-indigo-900 text-white border-2 border-indigo-800 flex flex-col justify-between select-none">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-indigo-100 uppercase tracking-wider">
                    Answer / Explanation
                  </span>
                  <span className="text-xs text-indigo-200 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Click to flip back</span>
                  </span>
                </div>

                <div className="my-auto py-6 text-center">
                  <p className="text-lg sm:text-xl font-medium leading-relaxed text-indigo-50">
                    {currentCard.answer}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-indigo-300 pt-4 border-t border-white/10">
                  <span>EduGenie Solution</span>
                  <span className="text-emerald-300 font-bold">Press Next or Spacebar</span>
                </div>
              </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            {/* Prev / Next buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors
                  ${
                    currentIndex === 0
                      ? 'border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-700 cursor-not-allowed'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
                title="Previous card"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <button
                type="button"
                onClick={handleFlip}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <RotateCw className="w-4 h-4 text-indigo-600" />
                <span>Flip Card</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === totalCards - 1}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors
                  ${
                    currentIndex === totalCards - 1
                      ? 'border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-700 cursor-not-allowed'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
                title="Next card"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Restart Deck"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Assessment buttons: Need Review vs I Know This */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkReview}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 border border-amber-200 dark:border-amber-900 transition-colors"
              >
                <X className="w-4 h-4 text-amber-600" />
                <span>Need Review</span>
              </button>

              <button
                type="button"
                onClick={handleMarkMastered}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>I Know This</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
