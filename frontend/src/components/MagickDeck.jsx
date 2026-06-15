import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

const SAMPLE_WILLS = [
  { text: 'GCP ACE 試験に合格する', desc: 'Google Cloud Certified Associate Cloud Engineer' },
  { text: 'Rustによる高速なWebサーバーの作り方を学ぶ', desc: 'メモリ安全かつ超高速なAPIサーバー構築' },
  { text: '量子コンピュータの動作原理と量子もつれを理解する', desc: '次世代計算モデルの基礎理論' },
  { text: '金融工学におけるブラック・ショールズ方程式を習得する', desc: 'デリバティブ価格決定理論の理解' },
];

function EmptyDeck({ onSetWill, isLoading }) {
  const [customWill, setCustomWill] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customWill.trim() || isLoading) return;
    onSetWill(customWill.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 py-12 max-w-4xl mx-auto select-none animate-fade-in">
      <div className="text-6xl mb-4 text-violet-accent animate-pulse-slow font-light">✦</div>
      <div className="mb-10 font-calligraphy text-2xl md:text-3xl text-violet-accent/90 tracking-widest leading-relaxed py-4 px-8 border-y border-violet-accent/15 max-w-xl mx-auto">
        汝の意志することを行え、<br className="sm:hidden" />それが法の全てとならん。
      </div>
      <h2 className="text-xl font-bold text-slate-200 mb-2 tracking-wide font-sans">Initialize Your Will</h2>
      <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
        Establish the gravity of your inquiry. Your Will anchor keeps the exploration focused, materializing path links from the space of all possibilities.
      </p>

      {/* Will Input Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-lg mb-10">
        <div className="flex gap-3 bg-night-800 border border-night-border focus-within:border-violet-accent/60 rounded-2xl p-2.5 transition-all duration-200">
          <input
            type="text"
            value={customWill}
            onChange={(e) => setCustomWill(e.target.value)}
            disabled={isLoading}
            placeholder="Type your grand objective... (e.g. GCP ACE Exam)"
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none px-3"
          />
          <button
            type="submit"
            disabled={isLoading || !customWill.trim()}
            className="bg-violet-accent hover:bg-violet-hover disabled:opacity-30 text-white font-medium text-sm rounded-xl px-5 py-2 transition-all duration-150 flex items-center gap-1.5 shadow-lg shadow-violet-accent/20"
          >
            Invoke
          </button>
        </div>
      </form>

      {/* Suggested Wills */}
      <div className="w-full max-w-2xl">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Or select a pre-defined Will</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SAMPLE_WILLS.map((w) => (
            <button
              key={w.text}
              onClick={() => !isLoading && onSetWill(w.text)}
              disabled={isLoading}
              className="text-left bg-night-800 hover:bg-night-700/80 border border-night-border hover:border-violet-accent/40 rounded-2xl p-4 transition-all duration-150 group flex flex-col justify-between h-24"
            >
              <span className="text-sm font-medium text-slate-300 group-hover:text-violet-accent transition-colors">
                {w.text}
              </span>
              <span className="text-xs text-slate-500 line-clamp-1">{w.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MagickDeck({ will, currentResponse, isLoading, onSetWill, onDive }) {
  const [activeTerm, setActiveTerm] = useState(null);

  useEffect(() => {
    setActiveTerm(null);
  }, [currentResponse]);

  if (!will || !currentResponse) {
    return <EmptyDeck onSetWill={onSetWill} isLoading={isLoading} />;
  }

  const { breadcrumb, explanation, term_suggestions, related_topics, magick_metadata } = currentResponse;

  return (
    <main className="flex-1 overflow-y-auto bg-night-900 px-6 py-8 relative">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
        
        {/* Navigation & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-night-border pb-5">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="text-violet-accent/60">WILL</span>
            <span>/</span>
            {breadcrumb.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <span className={idx === breadcrumb.length - 1 ? "text-slate-200 font-semibold" : ""}>
                  {crumb}
                </span>
                {idx < breadcrumb.length - 1 && <span>/</span>}
              </span>
            ))}
          </div>

          {/* Sync status */}
          <div className="flex items-center gap-2 self-start sm:self-center bg-violet-muted/20 border border-violet-accent/20 rounded-full px-3.5 py-1 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-accent animate-pulse" />
            <span className="text-slate-400 font-mono">Synced:</span>
            <span className="text-violet-accent font-mono truncate max-w-[200px]" title={magick_metadata?.obsidian_path}>
              {magick_metadata?.obsidian_path}
            </span>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-night-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center select-none">
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing circle */}
              <div className="w-16 h-16 rounded-full border border-violet-accent/30 animate-ping absolute" />
              {/* Inner rotating magic circle */}
              <div className="w-12 h-12 rounded-full border-2 border-t-violet-accent border-r-transparent border-b-violet-accent border-l-transparent animate-spin" />
              <span className="absolute text-sm text-violet-accent font-light">✦</span>
            </div>
            <p className="mt-4 text-xs font-mono tracking-widest text-violet-accent uppercase">Materializing Knowledge...</p>
          </div>
        )}

        {/* Core Explanation Panel */}
        <section className="bg-night-800 border border-night-border rounded-3xl p-6 sm:p-8 shadow-xl shadow-night-950/45">
          <div className="md-content text-slate-200 text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {explanation}
            </ReactMarkdown>
          </div>
        </section>

        {/* Term Suggestions Chips */}
        {term_suggestions && term_suggestions.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hadit Concepts (Term Suggestions)</h3>
            <div className="flex flex-wrap gap-2.5">
              {term_suggestions.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTerm(activeTerm?.term === t.term ? null : t)}
                  className={`text-xs px-3.5 py-2 rounded-xl transition-all duration-150 border font-mono ${
                    activeTerm?.term === t.term
                      ? 'bg-violet-accent/15 border-violet-accent text-violet-accent shadow-md shadow-violet-accent/5'
                      : 'bg-night-800 hover:bg-night-700 border-night-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ✦ {t.term}
                </button>
              ))}
            </div>

            {/* Active Term Details Overlay/Panel */}
            {activeTerm && (
              <div className="bg-night-800 border-l-2 border-l-violet-accent border-y border-r border-night-border rounded-r-2xl rounded-l-sm p-4 animate-fade-in shadow-lg">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="text-xs font-bold text-violet-accent font-mono uppercase tracking-wider">Concept: {activeTerm.term}</h4>
                  <button
                    onClick={() => setActiveTerm(null)}
                    className="text-slate-600 hover:text-slate-400 text-xs"
                  >
                    Close
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans">{activeTerm.hint}</p>
              </div>
            )}
          </section>
        )}

        {/* Related Topics Pilgrimage Selection */}
        {related_topics && related_topics.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pilgrimage Destinations (Related Topics)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related_topics.map((rt, idx) => (
                <button
                  key={idx}
                  onClick={() => onDive(rt.topic)}
                  disabled={isLoading}
                  className="text-left bg-night-800 hover:bg-night-700/80 border border-night-border hover:border-violet-accent/50 rounded-2xl p-5 transition-all duration-200 group flex flex-col justify-between gap-3 shadow-md shadow-night-950/20"
                >
                  <div className="space-y-1">
                    <span className="text-xs text-violet-accent font-mono tracking-wider font-semibold">DESTINATION 0{idx + 1}</span>
                    <h4 className="text-sm font-semibold text-slate-200 group-hover:text-violet-accent transition-colors font-sans">
                      {rt.topic}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    {rt.reason}
                  </p>
                  <div className="text-xs text-violet-accent opacity-0 group-hover:opacity-100 transition-opacity font-mono self-end flex items-center gap-1">
                    Dive In <span className="text-sm">→</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
