import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Trash2,
  PlusCircle,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  CornerDownLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { askTutor } from '../../services/api';
import { ChatMessage } from '../../types';
import { MarkdownView } from '../common/MarkdownView';

const SUGGESTED_QUESTIONS = [
  'Explain Bayes\' Theorem with a simple intuitive example',
  'How does QuickSort work and what is its average vs worst-case complexity?',
  'What is the difference between Mitosis and Meiosis?',
  'Derive the quadratic formula step-by-step',
];

export const AiTutor: React.FC = () => {
  const {
    profile,
    tutorPreloadQuestion,
    setTutorPreloadQuestion,
    addHistoryItem,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello ${profile.name}! 👋 I am **EduGenie**, your personal AI tutor.

I can help you:
- Break down difficult theories, math derivations, or scientific principles
- Provide step-by-step solutions to practice problems
- Explain complex topics with real-world analogies
- Quiz you on key definitions and concepts

What subject or question are we tackling today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle preloaded question from Dashboard or elsewhere
  useEffect(() => {
    if (tutorPreloadQuestion) {
      const q = tutorPreloadQuestion;
      setTutorPreloadQuestion(null);
      handleSendMessage(q);
    }
  }, [tutorPreloadQuestion]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || inputQuestion).trim();
    if (!question || isLoading) return;

    setErrorMsg(null);
    setInputQuestion('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build history payload for contextual memory
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const responseText = await askTutor({
        question,
        history: historyPayload,
        learningLevel: profile.learningLevel,
        answerStyle: profile.answerStyle,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Save to study history
      addHistoryItem({
        type: 'tutor',
        title: question.length > 40 ? question.slice(0, 40) + '...' : question,
        subtitle: `AI Tutor • ${profile.learningLevel}`,
        data: {
          question,
          answer: responseText,
        },
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      // Re-focus textarea
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Chat cleared. What would you like to explore next, ${profile.name}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleNewConversation = () => {
    handleClearChat();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">EduGenie AI Tutor</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Adapting to {profile.learningLevel} • {profile.answerStyle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/40 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Clear current messages"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs
                  ${isUser ? 'bg-gradient-to-tr from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800' : 'bg-gradient-to-tr from-indigo-600 to-violet-600'}
                `}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm relative group
                  ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs shadow-sm'
                      : 'bg-slate-100/90 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60 shadow-xs'
                  }
                `}
              >
                {/* Text Body */}
                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <MarkdownView content={msg.content} />
                )}

                {/* Footer: timestamp + copy button */}
                <div
                  className={`flex items-center justify-between gap-2 mt-2 pt-1 border-t text-[10px]
                    ${isUser ? 'border-white/20 text-indigo-100' : 'border-slate-200 dark:border-slate-700 text-slate-400'}
                  `}
                >
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-600 dark:hover:text-indigo-400"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* AI Loading State */}
        {isLoading && (
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-2xl rounded-tl-xs p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm shadow-xs flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
              <span className="font-medium animate-pulse">EduGenie is thinking...</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => handleSendMessage()}
              className="px-2 py-1 rounded bg-rose-100 dark:bg-rose-900/60 font-semibold hover:bg-rose-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* Suggested Prompts when few messages */}
        {messages.length === 1 && !isLoading && (
          <div className="pt-4">
            <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Suggested Academic Questions</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_QUESTIONS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all"
        >
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask EduGenie anything about your studies... (Press Enter to send, Shift+Enter for new line)`}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none focus:outline-none p-1.5 max-h-32"
          />

          <button
            type="submit"
            disabled={!inputQuestion.trim() || isLoading}
            className={`p-2.5 rounded-xl shrink-0 transition-all flex items-center justify-center
              ${
                inputQuestion.trim() && !isLoading
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              }
            `}
            title="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
          <span>Tip: You can ask for derivations, analogies, or counter-examples</span>
          <span className="hidden sm:inline">Enter ↵ to send</span>
        </div>
      </div>
    </div>
  );
};
