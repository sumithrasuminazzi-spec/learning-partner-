/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { AiTutor } from './components/tutor/AiTutor';
import { StudyMaterials } from './components/materials/StudyMaterials';
import { QuizGenerator } from './components/quiz/QuizGenerator';
import { FlashcardDeck } from './components/flashcards/FlashcardDeck';
import { StudyPlanner } from './components/planner/StudyPlanner';
import { AskFromNotes } from './components/notes/AskFromNotes';
import { HistoryView } from './components/history/HistoryView';
import { SettingsView } from './components/settings/SettingsView';
import { FeedbackView } from './components/feedback/FeedbackView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FFF9FB] dark:bg-[#18121B] min-h-screen text-[#3D313A] dark:text-pink-100">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'tutor' && <AiTutor />}
        {activeTab === 'materials' && <StudyMaterials />}
        {activeTab === 'quiz' && <QuizGenerator />}
        {activeTab === 'flashcards' && <FlashcardDeck />}
        {activeTab === 'planner' && <StudyPlanner />}
        {activeTab === 'notes' && <AskFromNotes />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'settings' && <SettingsView />}
        {activeTab === 'feedback' && <FeedbackView />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-[#FFF9FB] dark:bg-[#18121B] text-[#3D313A] dark:text-pink-100 font-['Plus_Jakarta_Sans',sans-serif]">
        <Sidebar />
        <MainContent />
      </div>
    </AppProvider>
  );
}
