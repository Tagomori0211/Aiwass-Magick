export default function Sidebar({
  model,
  models,
  temperature,
  maxTokens,
  onModelChange,
  onTemperatureChange,
  onMaxTokensChange,
  onClear,
}) {
  return (
    <aside className="w-64 flex-shrink-0 bg-night-800 border-r border-night-border flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-night-border">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✦</span>
          <div>
            <h1 className="text-base font-semibold text-violet-accent leading-tight">Aiwass Magick</h1>
            <p className="text-xs text-slate-500 mt-0.5">Knowledge Exploration</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

        {/* Model selector */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Model
          </label>
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full bg-night-700 border border-night-border text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-accent cursor-pointer"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id}
              </option>
            ))}
          </select>
          {models.find((m) => m.id === model)?.description && (
            <p className="text-xs text-slate-500 mt-1.5 leading-snug">
              {models.find((m) => m.id === model).description}
            </p>
          )}
        </div>

        {/* Temperature */}
        <div>
          <label className="flex justify-between text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            <span>Temperature</span>
            <span className="text-violet-accent font-mono">{temperature.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={temperature}
            onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
            className="w-full accent-violet-accent cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Max tokens */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Max Tokens
          </label>
          <input
            type="number"
            min={256}
            max={8192}
            step={256}
            value={maxTokens}
            onChange={(e) => onMaxTokensChange(Math.max(256, Math.min(8192, parseInt(e.target.value) || 2048)))}
            className="w-full bg-night-700 border border-night-border text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-accent font-mono"
          />
        </div>

        {/* Guardrail status */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Safety Guardrails
          </label>
          <div className="flex items-center gap-2 bg-night-700 border border-night-border rounded-lg px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse-slow" />
            <span className="text-xs text-emerald-400 font-medium">Active</span>
            <span className="text-xs text-slate-500 ml-auto">4 layers</span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5 leading-snug">
            Injection · Jailbreak · Banned topics · Output scan
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-night-border">
        <button
          onClick={onClear}
          className="w-full bg-night-700 hover:bg-night-600 border border-night-border text-slate-300 text-sm rounded-lg px-3 py-2 transition-colors duration-150 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          New Conversation
        </button>
        <p className="text-center text-xs text-slate-700 mt-3">
          Powered by DeepSeek API
        </p>
      </div>
    </aside>
  );
}
