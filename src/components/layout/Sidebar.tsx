import React from 'react';
import {
  LayoutDashboard,
  Bot,
  BookOpen,
  CheckCircle2,
  Layers,
  CalendarDays,
  FileText,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  X,
  HeartHandshake,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'materials', label: 'Study Materials', icon: BookOpen },
  { id: 'quiz', label: 'Quizzes', icon: CheckCircle2 },
  { id: 'tutor', label: 'AI Assistant', icon: Bot, badge: 'Live' },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'history', label: 'Progress', icon: TrendingUp },
  { id: 'feedback', label: 'Feedback', icon: HeartHandshake },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const SECONDARY_NAV_ITEMS: NavItem[] = [
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'planner', label: 'Study Plan', icon: CalendarDays },
];

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useApp();

  const handleNavClick = (id: NavigationTab) => {
    setActiveTab(id);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const renderNavButton = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => handleNavClick(item.id)}
        title={isSidebarCollapsed ? item.label : undefined}
        className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 group relative
          ${
            isActive
              ? 'bg-gradient-to-r from-[#F8A8C4] via-[#E8A0BC] to-[#C4B5FD] text-white shadow-sm shadow-pink-200/50'
              : 'text-[#766874] dark:text-pink-100/70 hover:bg-[#FEF2F6] dark:hover:bg-pink-950/30 hover:text-[#C85D83] dark:hover:text-pink-200'
          }
        `}
      >
        <Icon
          className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
            isActive ? 'text-white' : 'text-[#766874] dark:text-pink-200/60 group-hover:text-[#C85D83]'
          }`}
        />

        {!isSidebarCollapsed && (
          <span className="truncate flex-1 text-left">{item.label}</span>
        )}

        {!isSidebarCollapsed && item.badge && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isActive
                ? 'bg-white/30 text-white'
                : 'bg-[#FEF2F6] dark:bg-pink-950/60 text-[#C85D83] dark:text-pink-300 border border-[#FCE7F0]'
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-[#3D313A]/40 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen bg-white dark:bg-[#1E1622] border-r border-[#FCE7F0] dark:border-pink-950/40 transition-all duration-300 flex flex-col justify-between
          ${isSidebarCollapsed ? 'w-20' : 'w-64'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top Header / Brand */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-5 border-b border-[#FCE7F0] dark:border-pink-950/40">
            <div
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-3 cursor-pointer select-none overflow-hidden"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F8A8C4] via-[#C4B5FD] to-[#FDBA9A] flex items-center justify-center text-white shadow-md shadow-pink-200/50 shrink-0">
                <GraduationCap className="w-5 h-5 drop-shadow-xs" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg text-[#3D313A] dark:text-white tracking-tight">
                      EduGenie
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-[#F8A8C4]" />
                  </div>
                  <span className="text-[10px] text-[#766874] dark:text-pink-200/70 font-medium truncate">
                    AI Learning Companion
                  </span>
                </div>
              )}
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D313A] hover:bg-[#FEF2F6] dark:hover:bg-slate-800 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1">
            <div className="space-y-1">
              {PRIMARY_NAV_ITEMS.map(renderNavButton)}
            </div>

            {!isSidebarCollapsed && (
              <div className="pt-4 pb-1.5 px-3">
                <span className="text-[10px] font-bold text-[#766874]/70 uppercase tracking-wider">
                  More Tools
                </span>
              </div>
            )}
            <div className="space-y-1">
              {SECONDARY_NAV_ITEMS.map(renderNavButton)}
            </div>
          </nav>
        </div>

        {/* Footer / Desktop Collapse Toggle */}
        <div className="p-3 border-t border-[#FCE7F0] dark:border-pink-950/40 hidden md:block">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-[#766874] hover:text-[#3D313A] dark:text-pink-200/70 dark:hover:text-white rounded-xl hover:bg-[#FEF2F6] dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
