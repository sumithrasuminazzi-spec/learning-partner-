import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to parse inline formatting: **bold**, *italic*, `inline code`, etc.
  const renderInline = (text: string): React.ReactNode => {
    // Regex splits by code, bold, italic
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded text-xs font-mono bg-[#FEF2F6] dark:bg-pink-950/60 text-[#C85D83] dark:text-[#F8A8C4] border border-[#FCE7F0]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-slate-700 dark:text-slate-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  // Split lines and parse blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';
  let codeBlockIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block start / end
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        const codeText = codeBuffer.join('\n');
        const currentIndex = codeBlockIndex++;
        elements.push(
          <div
            key={`code-${i}`}
            className="relative my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900 text-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800/80 text-xs text-slate-400 border-b border-slate-700/50 font-mono">
              <span>{codeLanguage || 'code'}</span>
              <button
                onClick={() => handleCopy(codeText, currentIndex)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Copy code"
              >
                {copiedIndex === currentIndex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-sans">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-sans">Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-xs leading-relaxed font-mono">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="text-base font-bold text-slate-900 dark:text-slate-100 mt-4 mb-1.5">
          {renderInline(line.slice(4))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2 border-b border-slate-200 dark:border-slate-800 pb-1">
          {renderInline(line.slice(3))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h2 key={i} className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2">
          {renderInline(line.slice(2))}
        </h2>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={i}
          className="border-l-4 border-[#F8A8C4] pl-3 py-1 my-2 bg-[#FFF9FB] dark:bg-pink-950/20 text-[#3D313A] dark:text-pink-200 italic rounded-r text-sm"
        >
          {renderInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Bullet points
    if (line.match(/^[\*\-]\s+/)) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-1 text-sm text-[#3D313A] dark:text-pink-100 pl-2">
          <span className="text-[#F8A8C4] mt-1 select-none text-xs">•</span>
          <span className="flex-1 leading-relaxed">{renderInline(line.replace(/^[\*\-]\s+/, ''))}</span>
        </div>
      );
      continue;
    }

    // Numbered lists
    const numberMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numberMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-1 text-sm text-[#3D313A] dark:text-pink-100 pl-2">
          <span className="font-semibold text-[#F8A8C4] text-xs min-w-[1.2rem] mt-0.5">
            {numberMatch[1]}.
          </span>
          <span className="flex-1 leading-relaxed">{renderInline(numberMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={i} className="my-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {renderInline(line)}
      </p>
    );
  }

  return <div className={`space-y-0.5 ${className}`}>{elements}</div>;
};
