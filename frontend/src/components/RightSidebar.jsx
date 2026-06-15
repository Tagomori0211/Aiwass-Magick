import { useState, useEffect } from 'react';

export default function RightSidebar() {
  const [time, setTime] = useState('');
  const [memo, setMemo] = useState('');

  // Update clock every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hh}:${mm}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load memo from localStorage on mount
  useEffect(() => {
    const savedMemo = localStorage.getItem('aiwass_magick_memo');
    if (savedMemo) {
      setMemo(savedMemo);
    }
  }, []);

  // Save memo to localStorage on change
  const handleMemoChange = (e) => {
    const value = e.target.value;
    setMemo(value);
    localStorage.setItem('aiwass_magick_memo', value);
  };

  return (
    <aside className="w-72 h-full bg-night-950/80 border-l border-night-border flex flex-col select-text">
      {/* Top Header: Clock and Title */}
      <div className="p-5 border-b border-night-border flex items-center justify-between select-none">
        <span className="text-xs font-semibold tracking-widest text-slate-400 font-sans uppercase">
          魔術瞑想録
        </span>
        {/* Low contrast digital clock */}
        <span className="font-mono text-xs text-violet-accent/50 tracking-widest bg-night-900 px-2.5 py-1 rounded-lg border border-night-border select-none">
          {time}
        </span>
      </div>

      {/* Memo Content area */}
      <div className="flex-1 p-5 flex flex-col space-y-3 h-full overflow-hidden">
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono tracking-wider uppercase select-none">
          <span>Meditation Log</span>
          <span className="text-violet-accent/40 animate-pulse-slow">● auto-save</span>
        </div>
        <textarea
          value={memo}
          onChange={handleMemoChange}
          placeholder="探索の洞察や、次のダイブへの思考、瞑想の忘却を防ぐログをここに書き留めてください..."
          className="flex-1 w-full bg-night-900/30 border border-night-border focus:border-violet-accent/30 focus:ring-1 focus:ring-violet-accent/20 rounded-2xl p-4 text-xs text-slate-300 placeholder-slate-600 focus:outline-none resize-none leading-relaxed transition-all duration-200"
        />
      </div>
    </aside>
  );
}
