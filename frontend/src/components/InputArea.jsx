import { useState, useRef, useEffect } from 'react';

export default function InputArea({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const charCount = value.length;
  const nearLimit = charCount > 8000;

  return (
    <div className="px-4 py-4 border-t border-night-border bg-night-900">
      <div className={`flex gap-3 items-end bg-night-800 border rounded-2xl px-4 py-3 transition-colors ${
        nearLimit ? 'border-red-500/50' : 'border-night-border focus-within:border-violet-accent/60'
      }`}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder="Ask anything... (Enter to send, Shift+Enter for newline)"
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none leading-relaxed disabled:opacity-50"
          style={{ maxHeight: '200px' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="flex-shrink-0 w-9 h-9 rounded-xl bg-violet-accent hover:bg-violet-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center"
        >
          {disabled ? (
            <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      <div className="flex justify-between mt-1.5 px-1">
        <p className="text-xs text-slate-700">Enter↵ send · Shift+Enter newline</p>
        {nearLimit && (
          <p className="text-xs text-red-400">{charCount}/10000</p>
        )}
      </div>
    </div>
  );
}
