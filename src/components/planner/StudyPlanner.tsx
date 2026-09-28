import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Sparkles,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  TrendingUp,
  Bookmark,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateStudyPlan } from '../../services/api';
import { StudyPlan, StudyPlanTask } from '../../types';

export const StudyPlanner: React.FC = () => {
  const { profile, addHistoryItem, activeHistoryDetail } = useApp();

  const [subjectsInput, setSubjectsInput] = useState('Calculus, Organic Chemistry, World History');
  const [topicsInput, setTopicsInput] = useState('Integration techniques, Reaction mechanisms, WW2 Timeline');
  const [hoursPerDay, setHoursPerDay] = useState(3.5);
  const [targetDate, setTargetDate] = useState('Next 7 days');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Check if opened from history
  useEffect(() => {
    if (activeHistoryDetail && activeHistoryDetail.type === 'planner' && activeHistoryDetail.data) {
      setStudyPlan(activeHistoryDetail.data);
    }
  }, [activeHistoryDetail]);

  const handleGenerate = async () => {
    if (!subjectsInput.trim()) {
      setErrorMsg('Please specify at least one subject to plan.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setIsSaved(false);

    try {
      const subjectsArray = subjectsInput.split(',').map((s) => s.trim()).filter(Boolean);

      const plan = await generateStudyPlan({
        subjects: subjectsArray,
        topics: topicsInput.trim(),
        availableHoursPerDay: hoursPerDay,
        targetDate,
        priority,
      });

      setStudyPlan(plan);
      setCompletedTaskIds(new Set());

      // Save to history
      addHistoryItem({
        type: 'planner',
        title: plan.title || 'Personalized Study Plan',
        subtitle: `${subjectsArray.slice(0, 2).join(', ')} • ${hoursPerDay} hrs/day`,
        data: plan,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong while generating study plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTaskIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(taskId)) {
        copy.delete(taskId);
      } else {
        copy.add(taskId);
      }
      return copy;
    });
  };

  const handleSave = () => {
    if (!studyPlan) return;
    addHistoryItem({
      type: 'planner',
      title: studyPlan.title || 'Personalized Study Plan',
      subtitle: `${hoursPerDay} hrs/day • Target: ${targetDate}`,
      data: studyPlan,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Calculate task completion progress
  let totalTasks = 0;
  let completedCount = 0;

  if (studyPlan && studyPlan.days) {
    studyPlan.days.forEach((day) => {
      day.tasks.forEach((t) => {
        totalTasks++;
        if (completedTaskIds.has(t.id)) completedCount++;
      });
    });
  }

  const completionPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* 1. PLANNER CONFIGURATION */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>AI Study Planner & Timetable</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build a balanced, neuro-friendly timetable structured with high-yield focus blocks, revision intervals, and tactical exam tips.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Subjects (comma separated)
            </label>
            <input
              type="text"
              value={subjectsInput}
              onChange={(e) => setSubjectsInput(e.target.value)}
              placeholder="Calculus, Physics, History"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Timeframe
            </label>
            <input
              type="text"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              placeholder="e.g. Next 7 days, Midterm exam in 2 weeks"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="High">High (Intensive prep)</option>
              <option value="Medium">Medium (Balanced revision)</option>
              <option value="Low">Low (Casual catch-up)</option>
            </select>
          </div>
        </div>

        {/* Topics & Hours Slider */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Specific Topics, Chapters, or Weak Areas
            </label>
            <input
              type="text"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              placeholder="Integration techniques, Newton's Laws, Cold War dates"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Daily Study Time
              </label>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {hoursPerDay} hrs / day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !subjectsInput.trim()}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all
              ${
                isLoading || !subjectsInput.trim()
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 hover:scale-[1.01]'
              }
            `}
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                <span>Generating Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Create Study Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. GENERATED PLAN TIMETABLE */}
      {studyPlan && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  {studyPlan.dailyTargetHours} Hours Daily Target
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {studyPlan.title}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition-colors"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{isSaved ? 'Saved to History' : 'Save Plan'}</span>
                </button>
              </div>
            </div>

            {/* Overall Strategy */}
            {studyPlan.overallStrategy && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-indigo-900 dark:text-indigo-300 block mb-1">
                  Strategy & Execution Guide:
                </strong>
                {studyPlan.overallStrategy}
              </div>
            )}

            {/* Progress Tracker */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Plan Progress: {completedCount} of {totalTasks} tasks completed
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {completionPct}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Days Timetable */}
          <div className="space-y-4">
            {studyPlan.days?.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center justify-center">
                      {dayIdx + 1}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {day.dayName}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Focus: <strong className="text-slate-800 dark:text-slate-200">{day.focus}</strong>
                  </span>
                </div>

                {/* Tasks List */}
                <div className="space-y-2.5">
                  {day.tasks?.map((task) => {
                    const isDone = completedTaskIds.has(task.id);

                    return (
                      <div
                        key={task.id}
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isDone
                            ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200/70 dark:border-slate-700/70 hover:border-indigo-300 dark:hover:border-indigo-800'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => {}} // handled by parent div click
                            className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                                {task.subject}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  task.priority === 'High'
                                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                                }`}
                              >
                                {task.priority} Priority
                              </span>
                            </div>
                            <h5 className={`font-bold text-sm text-slate-900 dark:text-white ${isDone ? 'line-through text-slate-400' : ''}`}>
                              {task.topic}
                            </h5>
                            {task.tips && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                💡 {task.tips}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 sm:self-center pl-7 sm:pl-0">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{task.durationMinutes} min</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
