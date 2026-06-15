import { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MagickDeck from './components/MagickDeck';

const FALLBACK_MODELS = [
  { id: 'deepseek-v4-flash', description: 'Fast & efficient' },
  { id: 'deepseek-v4-pro', description: 'Most capable' },
];

function ErrorAlert({ message, onDismiss }) {
  return (
    <div className="mx-6 mt-6 flex items-start gap-3 bg-red-950/60 border border-red-700/50 rounded-xl px-4 py-3 animate-fade-in">
      <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-red-400 mb-0.5 font-sans">エラーが発生しました</p>
        <p className="text-xs text-red-300 break-words font-sans">{message}</p>
      </div>
      <button onClick={onDismiss} className="text-red-500 hover:text-red-300 flex-shrink-0 ml-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function App() {
  const [will, setWill] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [history, setHistory] = useState([]);
  const [cachedResponses, setCachedResponses] = useState([]);
  const [currentResponse, setCurrentResponse] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState(FALLBACK_MODELS);
  const [model, setModel] = useState('deepseek-v4-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [errorAlert, setErrorAlert] = useState(null);

  // Fetch model list on mount
  useEffect(() => {
    fetch('/api/models')
      .then((r) => r.json())
      .then((data) => {
        if (data.models?.length) {
          setModels(data.models);
          setModel(data.default || data.models[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const diveTo = useCallback(
    async (topic, targetWill = will, isNewWill = false) => {
      if (isLoading) return;
      setIsLoading(true);
      setErrorAlert(null);

      // Ensure React paints the MagickLoader immediately before the fetch thread starts blocking
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Prepare request payload
      const requestPayload = {
        will: targetWill,
        current_topic: topic,
        history: isNewWill ? [] : history,
        model,
        temperature,
      };

      try {
        const response = await fetch('/api/dive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        });

        if (!response.ok) {
          const err = await response.json();
          setErrorAlert(err.detail || 'APIリクエストに失敗しました。');
          return;
        }

        const data = await response.json();

        if (isNewWill) {
          setWill(targetWill);
          setHistory([topic]);
          setCachedResponses([data]);
          setCurrentResponse(data);
        } else {
          setHistory((prev) => [...prev, topic]);
          setCachedResponses((prev) => [...prev, data]);
          setCurrentResponse(data);
        }
        setCurrentTopic(topic);
      } catch (err) {
        setErrorAlert(err.message || '接続に失敗しました。バックエンドの稼働状態を確認してください。');
      } finally {
        setIsLoading(false);
      }
    },
    [will, history, model, temperature, isLoading]
  );

  const handleInitializeWill = useCallback(
    (newWill) => {
      diveTo(newWill, newWill, true);
    },
    [diveTo]
  );

  const handleResetWill = useCallback(() => {
    setWill('');
    setCurrentTopic('');
    setHistory([]);
    setCachedResponses([]);
    setCurrentResponse(null);
    setErrorAlert(null);
  }, []);

  const handleHistoryClick = useCallback(
    (topic, idx) => {
      if (cachedResponses[idx]) {
        setHistory(history.slice(0, idx + 1));
        setCachedResponses(cachedResponses.slice(0, idx + 1));
        setCurrentResponse(cachedResponses[idx]);
        setCurrentTopic(topic);
        setErrorAlert(null);
      } else {
        diveTo(topic);
      }
    },
    [history, cachedResponses, diveTo]
  );

  return (
    <div className="flex h-screen bg-night-900 text-slate-200 overflow-hidden font-sans">
      <Sidebar
        will={will}
        history={history}
        model={model}
        models={models}
        temperature={temperature}
        onModelChange={setModel}
        onTemperatureChange={setTemperature}
        onHistoryClick={handleHistoryClick}
        onResetWill={handleResetWill}
        isLoading={isLoading}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {errorAlert && (
          <ErrorAlert
            message={errorAlert}
            onDismiss={() => setErrorAlert(null)}
          />
        )}
        <MagickDeck
          will={will}
          currentResponse={currentResponse}
          isLoading={isLoading}
          onSetWill={handleInitializeWill}
          onDive={(topic) => diveTo(topic)}
        />
      </div>
    </div>
  );
}
