export default function Sidebar({
  will,
  history,
  model,
  models,
  temperature,
  onModelChange,
  onTemperatureChange,
  onHistoryClick,
  onResetWill,
  isLoading,
}) {
  return (
    <aside className="w-66 flex-shrink-0 bg-night-800 border-r border-night-border flex flex-col h-full select-none">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-night-border">
        <div className="flex items-center gap-3">
          <span className="text-2xl text-violet-accent animate-pulse-slow">✦</span>
          <div>
            <h1 className="text-sm font-bold text-violet-accent tracking-wider leading-tight">AIWASS MAGICK</h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">Hadit & Nuit Engine</p>
          </div>
        </div>
      </div>

      {/* Will Anchor Display */}
      {will && (
        <div className="px-4 py-4 border-b border-night-border bg-night-900/40 animate-fade-in">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
            意志の重力 (Will Anchor)
          </label>
          <div className="bg-violet-muted/10 border border-violet-accent/20 rounded-xl p-3 space-y-2">
            <p className="text-xs text-slate-300 font-medium leading-relaxed break-words font-sans">
              {will}
            </p>
            <button
              onClick={onResetWill}
              disabled={isLoading}
              className="text-[10px] text-red-400 hover:text-red-300 font-mono flex items-center gap-1 transition-colors disabled:opacity-30"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              意志の破棄
            </button>
          </div>
        </div>
      )}

      {/* History / Pilgrimage Nodes */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 font-mono">
            巡礼の軌跡（探索履歴） ({history.length})
          </label>
          {history.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center p-4 border border-dashed border-night-border rounded-xl">
              <span className="text-xs text-slate-600 font-sans leading-relaxed">
                軌跡が空です。<br />意志を決定して巡礼を開始してください。
              </span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[300px]">
              {history.map((h, idx) => (
                <button
                  key={idx}
                  onClick={() => !isLoading && onHistoryClick(h, idx)}
                  disabled={isLoading}
                  className="w-full text-left bg-night-700/30 hover:bg-night-700/80 border border-night-border/50 hover:border-violet-accent/20 rounded-xl px-3 py-2.5 transition-all duration-150 group flex items-start gap-2.5 disabled:opacity-50"
                  title="クリックしてこの目的地へ巻き戻す"
                >
                  <span className="text-[10px] text-violet-accent font-mono mt-0.5">0{idx + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors truncate font-sans">
                      {h}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Space divider */}
        <div className="h-px bg-night-border my-5" />

        {/* Controls */}
        <div className="space-y-5">
          {/* Model selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">
              召喚モデル (Model)
            </label>
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full bg-night-700 border border-night-border text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-violet-accent cursor-pointer font-sans"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id}
                </option>
              ))}
            </select>
          </div>

          {/* Temperature */}
          <div>
            <label className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">
              <span>温度（創造性）</span>
              <span className="text-violet-accent font-mono">{temperature.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.1}
              value={temperature}
              onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
              className="w-full accent-violet-accent cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-600 mt-1 font-mono uppercase tracking-wider">
              <span>Hadit (精密)</span>
              <span>Nuit (創造)</span>
            </div>
          </div>


        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-night-border text-center">
        <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">
          Powered by DeepSeek API
        </p>
      </div>
    </aside>
  );
}
