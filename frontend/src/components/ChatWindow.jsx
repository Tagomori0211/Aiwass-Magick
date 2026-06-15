import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import InputArea from './InputArea';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 select-none">
      <div className="text-5xl mb-6 opacity-20">✦</div>
      <h2 className="text-lg font-semibold text-slate-400 mb-2">Aiwass Awaits</h2>
      <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
        Ask anything. Explore knowledge, reason through code, analyse ideas, or venture into the unknown.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-sm">
        {[
          'Explain quantum entanglement in simple terms',
          'Write a Python async web scraper',
          'Compare Stoicism and Existentialism',
          'Debug this TypeScript generic type',
        ].map((s) => (
          <button
            key={s}
            className="text-left text-xs text-slate-500 hover:text-slate-300 bg-night-800 hover:bg-night-700 border border-night-border hover:border-violet-accent/40 rounded-xl px-3 py-2.5 transition-all duration-150 leading-snug"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function GuardrailAlert({ message, onDismiss }) {
  return (
    <div className="mx-4 mt-3 flex items-start gap-3 bg-red-950/60 border border-red-700/50 rounded-xl px-4 py-3 animate-fade-in">
      <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-red-400 mb-0.5">Guardrail Blocked</p>
        <p className="text-xs text-red-300 break-words">{message}</p>
      </div>
      <button onClick={onDismiss} className="text-red-500 hover:text-red-300 flex-shrink-0 ml-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ChatWindow({ messages, isStreaming, onSend, guardrailAlert, onDismissAlert }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-night-900">
      {/* Alert banner */}
      {guardrailAlert && (
        <GuardrailAlert message={guardrailAlert} onDismiss={onDismissAlert} />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <InputArea onSend={onSend} disabled={isStreaming} />
    </main>
  );
}
