import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

const WILL_POOL = [
  { text: 'GCP ACE 試験に合格する', desc: 'Google Cloud 認定アソシエイトクラウドエンジニア試験対策' },
  { text: 'Rustによる高速なWebサーバーの作り方を学ぶ', desc: 'メモリ安全かつ超高速なAPIサーバー構築とアクターモデル' },
  { text: '量子コンピュータの動作原理と量子もつれを理解する', desc: '量子ビット、重ね合わせ、量子ゲートとベルの不等式' },
  { text: '金融工学におけるブラック・ショールズ方程式を習得する', desc: '偏微分方程式によるデリバティブ（オプション）価格決定理論' },
  { text: 'アレイスター・クロウリーのテレマ哲学と魔術体系を探求する', desc: '「汝の意志することを行え」が意味する真の意志（True Will）' },
  { text: 'カバラの生命の樹（セフィロト）の10のセフィラとパスを紐解く', desc: 'ヘブライ神秘主義における創造の段階とシンボリズム' },
  { text: 'ニーチェの実存主義と『超人（Übermensch）』思想を理解する', desc: '神の死、永劫回帰、そして力への意志の哲学' },
  { text: '相対性理論における時空の歪みとブラックホールの関係を学ぶ', desc: 'アインシュタイン方程式からシュヴァルツシルト半径まで' },
  { text: 'Dockerマルチステージビルドによるイメージ軽量化手法を究める', desc: 'プロダクション環境向け安全かつ最小のDockerイメージビルド' },
  { text: 'Kubernetesクラスターのセキュリティ堅牢化とRBAC設計を習得する', desc: '最小特権の原則に基づいたPodセキュリティとネットワークポリシー' },
  { text: '暗号通貨とゼロ知識証明（ZKP）の数学的基礎を調査する', desc: 'プライバシー保護とzk-SNARKs、zk-STARKsの原理' },
  { text: 'カントの純粋理性批判における先天的総合判断を整理する', desc: '認識が対象に従う「コペルニクス的転回」とア・プリオリ' },
  { text: '邪馬台国の所在地論争（畿内説 vs 九州説）の論点を比較する', desc: '魏志倭人伝の記述と考古学的出土品（三角縁神獣鏡など）の検証' },
  { text: '深層学習におけるトランスフォーマーのSelf-Attention機構を究める', desc: '自然言語処理と生成AIの基礎、QKVベクトルの内積とスケーリング' },
  { text: 'タロットカード大アルカナ22枚の象徴主義と黄金の夜明け団の対応', desc: '魔術結社によるヘブライ文字と占星術的属性の統合' },
  { text: 'Pythonによるマルコフ連鎖モンテカルロ法（MCMC）の実装', desc: 'ベイズ統計における事後分布のサンプリングとメトロポリス・ヘイスティングス法' },
  { text: 'カオス理論におけるバタフライ効果とローレンツ・アトラクタ', desc: '非線形動的システムにおける初期値鋭敏性とストレンジ・アトラクタ' },
  { text: '東洋哲学における唯識思想と西洋精神分析学の共通点', desc: '阿頼耶識（あらやしき）とユングの普遍的無意識の比較研究' },
  { text: 'Go言語による分散型Key-Valueストアの自作手法を学ぶ', desc: 'Raftコンセンサスアルゴリズムを用いた一貫性と耐障害性の実装' },
  { text: 'サイバーパンクSF文学におけるディストピアの系譜を整理する', desc: 'ギブスン『ニューロマンサー』から紐解くハイテクとローライフ' }
];

const getDailyWills = (pool) => {
  const today = new Date();
  // Use YYYY-MM-DD as seed source
  const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Seeded linear congruential generator (LCG)
  const pseudoRandom = (seed) => {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  };
  
  const rand = pseudoRandom(Math.abs(hash));
  
  // Seeded shuffle
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  
  return shuffled.slice(0, 4);
};

function EmptyDeck({ onSetWill, isLoading }) {
  const [customWill, setCustomWill] = useState('');

  const dailyWills = useMemo(() => getDailyWills(WILL_POOL), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customWill.trim() || isLoading) return;
    onSetWill(customWill.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 py-12 max-w-4xl mx-auto select-none animate-fade-in relative">
      <div className="text-6xl mb-4 text-violet-accent animate-pulse-slow font-light">✦</div>
      <div className="mb-10 flex flex-col items-center justify-center py-6 px-10 border-y border-violet-accent/15 max-w-2xl mx-auto">
        {/* Calligraphy brush text with metallic gold gradient */}
        <div className="font-calligraphy text-3xl md:text-4xl tracking-widest leading-loose text-gold-metallic select-none pb-2">
          汝の欲する所を為せ、<br />それが汝の法とならん
        </div>
        {/* Serif italic English subtext */}
        <div className="font-serif-italic text-sm md:text-lg tracking-wider text-gold-metallic opacity-85 select-none pt-2">
          Do what thou wilt shall be the whole of the Law
        </div>
      </div>
      <h2 className="text-xl font-bold text-slate-200 mb-2 tracking-wide font-sans">探求意志の決定</h2>
      <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
        あなたの探求の「重力（軸）」となる意志を決定してください。意志の重力によって探索がブレるのを防ぎ、すべての可能性の空間からHadit（知識ノード）を物質化します。
      </p>

      {/* Will Input Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-lg mb-10">
        <div className="flex gap-3 bg-night-800 border border-night-border focus-within:border-violet-accent/60 rounded-2xl p-2.5 transition-all duration-200">
          <input
            type="text"
            value={customWill}
            onChange={(e) => setCustomWill(e.target.value)}
            disabled={isLoading}
            placeholder="大いなる探求目標を入力してください..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none px-3 font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !customWill.trim()}
            className="bg-violet-accent hover:bg-violet-hover disabled:opacity-30 text-white font-medium text-sm rounded-xl px-5 py-2 transition-all duration-150 flex items-center gap-1.5 shadow-lg shadow-violet-accent/20"
          >
            DIVE
          </button>
        </div>
      </form>

      {/* Suggested Wills */}
      <div className="w-full max-w-2xl">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">または、本日のおすすめ意志から選択する</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dailyWills.map((w) => (
            <button
              key={w.text}
              onClick={() => !isLoading && onSetWill(w.text)}
              disabled={isLoading}
              className="text-left bg-night-800 hover:bg-night-700/80 border border-night-border hover:border-violet-accent/40 rounded-2xl p-4 transition-all duration-150 group flex flex-col justify-between h-24"
            >
              <span className="text-sm font-medium text-slate-300 group-hover:text-violet-accent transition-colors font-sans">
                {w.text}
              </span>
              <span className="text-xs text-slate-500 line-clamp-1 font-sans">{w.desc}</span>
            </button>
          ))}
        </div>
      </div>
      {isLoading && <MagickLoader />}
    </div>
  );
}

const LOADING_MESSAGES = [
  '意志の重力 (Will Anchor) を調整中...',
  '全可能性の空間 (Nuit) より知識を探索中...',
  '文脈追従ベクトル（Haditの軌道）を計算中...',
  'Aiwass 錬成器を召喚中...',
  '概念の欠片 (Hadit) を物質化中...',
];

function MagickLoader() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0.0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(msgTimer);
  }, []);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) return 99;
        const diff = 99 - prev;
        // Exponentially slows down as it approaches 99%
        const step = Math.max(0.1, diff * 0.08);
        return parseFloat((prev + step).toFixed(1));
      });
    }, 120);
    return () => clearInterval(progressTimer);
  }, []);

  return (
    <div className="absolute inset-0 bg-night-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center select-none animate-fade-in p-6">
      <div className="relative flex items-center justify-center">
        {/* Glow effect background */}
        <div className="absolute w-72 h-72 rounded-full bg-violet-accent/5 filter blur-3xl animate-pulse-slow" />
        
        {/* Magic Circle SVG */}
        <svg className="w-64 h-64 md:w-80 md:h-80 text-violet-accent/60 drop-shadow-[0_0_12px_rgba(124,107,255,0.2)]" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <path id="textCircle" d="M 150, 150 m -115, 0 a 115,115 0 1,1 230,0 a 115,115 0 1,1 -230,0" fill="none" />
          </defs>
          
          {/* Outermost circle */}
          <circle cx="150" cy="150" r="140" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" className="animate-spin-slow" />
          <circle cx="150" cy="150" r="133" stroke="currentColor" strokeWidth="1.5" className="opacity-80" />
          
          {/* Spell Text (Reversing) */}
          <g className="animate-spin-reverse-slow">
            <text fill="currentColor" className="text-[8.5px] font-mono tracking-[0.22em] uppercase font-bold opacity-80">
              <textPath href="#textCircle" startOffset="0%">
                Do what thou wilt shall be the whole of the Law • Love is the law, love under will • Hadit Nuit Thelema •
              </textPath>
            </text>
          </g>
          
          {/* Middle structures */}
          <circle cx="150" cy="150" r="105" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="150" cy="150" r="100" stroke="currentColor" strokeWidth="1" strokeDasharray="16 6" className="animate-spin-medium" />
          
          {/* Hexagram (Double Triangle) */}
          <g className="animate-spin-slow">
            <polygon points="150,47 239,201 61,201" stroke="currentColor" strokeWidth="1" className="opacity-70" />
            <polygon points="150,253 239,99 61,99" stroke="currentColor" strokeWidth="1" className="opacity-70" />
            <circle cx="150" cy="150" r="80" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 4" />
          </g>
          
          {/* Innermost ring */}
          <circle cx="150" cy="150" r="50" stroke="currentColor" strokeWidth="1.5" />
          
          {/* Core Symbol */}
          <g className="animate-pulse-slow">
            <circle cx="150" cy="150" r="12" fill="currentColor" className="text-violet-accent/20" />
            <circle cx="150" cy="150" r="8" stroke="currentColor" strokeWidth="1" />
            <path d="M 150, 132 L 150, 168 M 132, 150 L 168, 150" stroke="currentColor" strokeWidth="1" className="opacity-80" />
          </g>
        </svg>
        
        {/* Pulsing center star */}
        <span className="absolute text-xl text-violet-accent animate-pulse font-light">✦</span>
      </div>
      
      {/* Mystical Messages & Sync Rate */}
      <div className="mt-8 text-center space-y-3 max-w-sm">
        <div className="space-y-1">
          <p className="text-xs font-mono tracking-widest text-violet-accent uppercase animate-pulse">
            {LOADING_MESSAGES[msgIdx]}
          </p>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
            Aiwass is materializing Nuit possibilities
          </p>
        </div>
        
        {/* Progress percent display */}
        <div className="inline-block bg-violet-accent/10 border border-violet-accent/30 rounded-xl px-4 py-1.5 shadow-md shadow-violet-accent/5">
          <p className="text-sm font-mono text-violet-accent font-semibold tracking-wider">
            召喚同調率: <span className="text-base text-slate-200">{progress.toFixed(1)}</span> %
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MagickDeck({ will, currentResponse, isLoading, onSetWill, onDive }) {
  const [activeTerm, setActiveTerm] = useState(null);
  const [customTopic, setCustomTopic] = useState('');

  useEffect(() => {
    setActiveTerm(null);
    setCustomTopic('');
  }, [currentResponse]);

  if (!will || !currentResponse) {
    return <EmptyDeck onSetWill={onSetWill} isLoading={isLoading} />;
  }

  const { breadcrumb, explanation, term_suggestions, related_topics, magick_metadata } = currentResponse;

  return (
    <main className="flex-1 overflow-y-auto bg-cosmic-dark px-6 py-8 relative">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
        
        {/* Navigation & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-night-border pb-5">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="text-violet-accent/60">意志</span>
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
        </div>

        {/* Loading Overlay */}
        {isLoading && <MagickLoader />}

        {/* Core Explanation Panel */}
        <section className="bg-night-800 border border-night-border rounded-3xl p-6 sm:p-8 shadow-xl shadow-night-950/45 animate-fade-in">
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

        {/* Free-form Custom Topic Dive Section */}
        <section className="bg-night-800 border border-night-border rounded-3xl p-5 shadow-lg shadow-night-950/20 animate-fade-in space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">自由意志によるダイブ</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customTopic.trim() && !isLoading) {
                onDive(customTopic.trim());
              }
            }}
            className="flex gap-3 bg-night-900 border border-night-border focus-within:border-violet-accent/60 rounded-2xl p-2 transition-all duration-200"
          >
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              disabled={isLoading}
              placeholder="自由な目的地（トピック）を入力してさらにダイブする..."
              className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none px-3 font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !customTopic.trim()}
              className="bg-violet-accent hover:bg-violet-hover disabled:opacity-30 text-white font-medium text-xs rounded-xl px-4 py-2 transition-all duration-150 flex items-center gap-1 shadow-md shadow-violet-accent/10"
            >
              DIVE
            </button>
          </form>
        </section>

        {/* Term Suggestions Chips */}
        {term_suggestions && term_suggestions.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Hadit 概念（文脈用語）</h3>
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
                  <h4 className="text-xs font-bold text-violet-accent font-mono uppercase tracking-wider">概念: {activeTerm.term}</h4>
                  <button
                    onClick={() => setActiveTerm(null)}
                    className="text-slate-600 hover:text-slate-400 text-xs font-sans"
                  >
                    閉じる
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
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">巡礼の目的地（関連トピック）</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related_topics.map((rt, idx) => (
                <button
                  key={idx}
                  onClick={() => onDive(rt.topic)}
                  disabled={isLoading}
                  className="text-left bg-night-800 hover:bg-night-700/80 border border-night-border hover:border-violet-accent/50 rounded-2xl p-5 transition-all duration-200 group flex flex-col justify-between gap-3 shadow-md shadow-night-950/20"
                >
                  <div className="space-y-1">
                    <span className="text-xs text-violet-accent font-mono tracking-wider font-semibold">目的地 0{idx + 1}</span>
                    <h4 className="text-sm font-semibold text-slate-200 group-hover:text-violet-accent transition-colors font-sans">
                      {rt.topic}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    {rt.reason}
                  </p>
                  <div className="text-xs text-violet-accent opacity-0 group-hover:opacity-100 transition-opacity font-mono self-end flex items-center gap-1">
                    ダイブする <span className="text-sm">→</span>
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
