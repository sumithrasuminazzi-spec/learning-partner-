import React, { useState, useEffect } from 'react';
import {
  Star,
  Sparkles,
  Heart,
  Send,
  MessageSquare,
  CheckCircle2,
  Smile,
  ThumbsUp,
  RefreshCw,
  ArrowRight,
  Clock,
  User,
  Tag,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FeedbackEntry } from '../../types';

const CATEGORIES = [
  { id: 'tutor', label: 'AI Tutor Experience', icon: Sparkles, color: 'text-[#C85D83] bg-[#FEF2F6] border-[#FCE7F0]' },
  { id: 'materials', label: 'Study Materials & Notes', icon: Tag, color: 'text-[#7C3AED] bg-[#F8F5FF] border-[#EFEAFE]' },
  { id: 'quizzes', label: 'Quizzes & Flashcards', icon: ThumbsUp, color: 'text-[#D96B43] bg-[#FFF7F2] border-[#FCE9DE]' },
  { id: 'design', label: 'Design & Visual Aesthetic', icon: Heart, color: 'text-[#C85D83] bg-[#FEF2F6] border-[#FCE7F0]' },
  { id: 'planner', label: 'Study Planner & Timetable', icon: Clock, color: 'text-[#7C3AED] bg-[#F8F5FF] border-[#EFEAFE]' },
  { id: 'bug', label: 'Bug or Issue Report', icon: MessageSquare, color: 'text-[#D96B43] bg-[#FFF7F2] border-[#FCE9DE]' },
  { id: 'feature', label: 'Feature Suggestion', icon: Star, color: 'text-[#C85D83] bg-[#FEF2F6] border-[#FCE7F0]' },
  { id: 'general', label: 'General Thoughts & Love', icon: Smile, color: 'text-[#7C3AED] bg-[#F8F5FF] border-[#EFEAFE]' },
];

const QUICK_TAGS = [
  'Super clear explanations ✨',
  'Love the soft pastel look 🌸',
  'Fast & helpful AI answers ⚡',
  'Helped me study for exams 📚',
  'More practice quiz questions 🎯',
  'Easy to navigate 💖',
];

const RATING_DESCRIPTIONS: Record<number, { text: string; emoji: string }> = {
  1: { text: 'Needs Improvement', emoji: '🥺' },
  2: { text: 'Fair / Okay', emoji: '🙂' },
  3: { text: 'Good Experience', emoji: '😊' },
  4: { text: 'Very Good!', emoji: '🌸' },
  5: { text: 'Magical & Wonderful!', emoji: '✨💖' },
};

export const FeedbackView: React.FC = () => {
  const { profile, setActiveTab } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('AI Tutor Experience');
  const [comments, setComments] = useState<string>('');
  const [studentName, setStudentName] = useState<string>(profile.name);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Love the soft pastel look 🌸']);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<FeedbackEntry | null>(null);
  const [pastFeedbackList, setPastFeedbackList] = useState<FeedbackEntry[]>([]);

  // Load past feedback from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('edugenie_feedback_log');
      if (stored) {
        setPastFeedbackList(JSON.parse(stored));
      }
    } catch {
      // ignore parsing error
    }
  }, []);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim() && selectedTags.length === 0) {
      return;
    }

    setIsSubmitting(true);

    const newFeedback: FeedbackEntry = {
      id: `fb-${Date.now()}`,
      studentName: studentName.trim() || profile.name || 'Student',
      rating,
      category,
      comments: comments.trim() || 'No detailed comments provided.',
      tags: selectedTags,
      submittedAt: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedFeedback(newFeedback);

      // Save to localStorage
      const updatedList = [newFeedback, ...pastFeedbackList];
      setPastFeedbackList(updatedList);
      try {
        localStorage.setItem('edugenie_feedback_log', JSON.stringify(updatedList));
      } catch {
        // ignore
      }
    }, 500);
  };

  const handleResetForm = () => {
    setSubmittedFeedback(null);
    setComments('');
    setRating(5);
    setCategory('AI Tutor Experience');
    setSelectedTags([]);
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#F8A8C4] via-[#C4B5FD] to-[#FDBA9A] text-[#3D313A] p-6 sm:p-8 shadow-md border border-white/50">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-white/30 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-56 h-56 rounded-full bg-[#C4B5FD]/30 blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md text-xs font-bold text-[#3D313A] border border-white/60 shadow-2xs">
            <Heart className="w-3.5 h-3.5 text-[#C85D83] fill-[#C85D83]" />
            <span>We Value Your Voice</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Share Your EduGenie Experience
          </h1>
          <p className="text-xs sm:text-sm text-[#3D313A]/90 font-medium leading-relaxed">
            Your honest feedback and creative ideas help us refine our AI explanations, design, and study tools to make every learning session magical for you!
          </p>
        </div>
      </div>

      {/* 2. Success / Confirmation State */}
      {submittedFeedback ? (
        <div className="p-7 sm:p-10 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] dark:border-pink-950/40 shadow-sm text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#F8A8C4] via-[#C4B5FD] to-[#FDBA9A] mx-auto flex items-center justify-center text-white shadow-lg shadow-pink-200/50">
            <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-xs" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F6] text-[#C85D83] border border-[#FCE7F0] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#F8A8C4]" />
              <span>Feedback Received With Love</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#3D313A] dark:text-white">
              Thank You, {submittedFeedback.studentName}! 🌸
            </h2>
            <p className="text-xs sm:text-sm text-[#766874] dark:text-pink-200/70 leading-relaxed">
              We have received your thoughts. Your feedback helps make EduGenie a friendlier, smarter companion for all students!
            </p>
          </div>

          {/* Submission Details Card */}
          <div className="max-w-lg mx-auto p-5 rounded-2xl bg-[#FFF9FB] dark:bg-pink-950/20 border border-[#FCE7F0] text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#766874] font-medium">Your Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= submittedFeedback.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-[#3D313A] ml-1">
                  ({submittedFeedback.rating}/5)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#766874] font-medium">Category:</span>
              <span className="font-bold text-[#C85D83] bg-[#FEF2F6] px-2.5 py-0.5 rounded-full border border-[#FCE7F0]">
                {submittedFeedback.category}
              </span>
            </div>

            {submittedFeedback.tags && submittedFeedback.tags.length > 0 && (
              <div className="pt-2 border-t border-[#FCE7F0]/60">
                <span className="text-[11px] text-[#766874] font-medium block mb-1.5">Selected Tags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {submittedFeedback.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-pink-950/40 text-[#3D313A] dark:text-pink-100 border border-[#FCE7F0]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-[#FCE7F0]/60">
              <span className="text-[11px] text-[#766874] font-medium block mb-1">Your Comment:</span>
              <p className="text-xs text-[#3D313A] dark:text-pink-100 italic bg-white dark:bg-pink-950/40 p-2.5 rounded-xl border border-[#FCE7F0]">
                "{submittedFeedback.comments}"
              </p>
            </div>

            <div className="text-[10px] text-[#766874]/70 text-right">
              Submitted on {submittedFeedback.submittedAt}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetForm}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#FEF2F6] hover:bg-[#FCE7F0] text-[#C85D83] text-xs font-bold transition-all border border-[#FCE7F0] flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Submit Another Feedback</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#F8A8C4] via-[#EFA3C0] to-[#C4B5FD] hover:opacity-95 text-white text-xs font-bold transition-all shadow-sm shadow-pink-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Home Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* 3. Main Feedback Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] dark:border-pink-950/40 shadow-xs space-y-6">
            {/* A. Star Rating Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#3D313A] dark:text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#F8A8C4] fill-[#F8A8C4]" />
                  <span>Rate Your Experience</span>
                </label>
                <span className="text-xs font-bold text-[#C85D83] bg-[#FEF2F6] px-3 py-1 rounded-full border border-[#FCE7F0] flex items-center gap-1">
                  <span>{RATING_DESCRIPTIONS[activeRating]?.emoji}</span>
                  <span>{RATING_DESCRIPTIONS[activeRating]?.text}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-4 rounded-2xl bg-[#FFF9FB] dark:bg-pink-950/20 border border-[#FCE7F0] justify-center sm:justify-start">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= activeRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 rounded-xl transition-all duration-150 transform hover:scale-125 focus:outline-none cursor-pointer"
                      aria-label={`Rate ${star} out of 5 stars`}
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          isFilled
                            ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                            : 'text-slate-300 dark:text-slate-600 hover:text-amber-200'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-semibold text-[#766874] ml-2 hidden sm:inline">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* B. Feedback Category Selector */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-[#3D313A] dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#C4B5FD]" />
                <span>Select Feedback Category</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.label;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.label)}
                      className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#FEF2F6] to-[#F8F5FF] border-[#F8A8C4] text-[#C85D83] ring-2 ring-[#F8A8C4]/30 shadow-2xs'
                          : 'bg-white dark:bg-pink-950/20 border-[#FCE7F0] text-[#766874] hover:border-[#F8A8C4]/60 hover:bg-[#FEF2F6]/50'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${cat.color}`}
                      >
                        <cat.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate flex-1">{cat.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#C85D83] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* C. Quick Praise & Suggestion Chips */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-[#766874] dark:text-pink-200/80 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FDBA9A]" />
                <span>Quick Tags (Click to toggle)</span>
              </label>

              <div className="flex flex-wrap gap-2">
                {QUICK_TAGS.map((tag) => {
                  const isTagSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                        isTagSelected
                          ? 'bg-[#FEF2F6] border-[#F8A8C4] text-[#C85D83] shadow-2xs font-semibold'
                          : 'bg-white dark:bg-pink-950/20 border-[#FCE7F0] text-[#766874] hover:bg-[#FEF2F6]/40'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* D. Detailed Comments & Suggestions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#3D313A] dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#F8A8C4]" />
                  <span>Your Suggestions & Comments</span>
                </label>
                <span className="text-[11px] text-[#766874]">
                  {comments.length}/600 chars
                </span>
              </div>

              <textarea
                rows={4}
                maxLength={600}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Tell us what you loved, what could be improved, or any features you would love to see next in EduGenie..."
                className="w-full p-4 rounded-2xl bg-[#FFF9FB] dark:bg-pink-950/20 border border-[#FCE7F0] text-sm text-[#3D313A] dark:text-pink-100 placeholder:text-[#766874]/60 focus:outline-none focus:ring-3 focus:ring-[#F8A8C4]/40 focus:border-[#F8A8C4] transition-all resize-y"
              />
            </div>

            {/* E. Student Name / Persona */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#FCE7F0]/60">
              <div>
                <label className="block text-xs font-bold text-[#766874] dark:text-pink-200/80 mb-1.5">
                  Your Display Name (Optional)
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-[#766874]/60 absolute left-3.5" />
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder={profile.name || 'Student Name'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF9FB] dark:bg-pink-950/20 border border-[#FCE7F0] text-xs text-[#3D313A] dark:text-pink-100 focus:outline-none focus:ring-2 focus:ring-[#F8A8C4]/40"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8F5FF] border border-[#EFEAFE] text-[11px] text-[#7C3AED]">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Feedback will be attributed to your current student persona.</span>
                </div>
              </div>
            </div>

            {/* F. Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#766874]">
                🌸 We review every student suggestion carefully!
              </span>

              <button
                type="submit"
                disabled={isSubmitting || (!comments.trim() && selectedTags.length === 0)}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-[#F8A8C4] via-[#EFA3C0] to-[#C4B5FD] hover:opacity-95 text-white font-bold text-sm shadow-md shadow-pink-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Submitting Feedback...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 4. Past Feedback History Section */}
      {pastFeedbackList.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1622] border border-[#FCE7F0] dark:border-pink-950/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#3D313A] dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F8A8C4]" />
              <span>Your Previous Feedback ({pastFeedbackList.length})</span>
            </h3>
            <span className="text-[11px] text-[#766874]">Saved locally</span>
          </div>

          <div className="space-y-3">
            {pastFeedbackList.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#FFF9FB] dark:bg-pink-950/20 border border-[#FCE7F0] space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= item.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-[#C85D83] bg-[#FEF2F6] px-2 py-0.5 rounded-full border border-[#FCE7F0] text-[10px]">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#766874]">{item.submittedAt}</span>
                </div>

                <p className="text-xs text-[#3D313A] dark:text-pink-100 italic leading-relaxed">
                  "{item.comments}"
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white dark:bg-pink-950/50 text-[#766874] border border-[#FCE7F0]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
