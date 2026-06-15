import { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

const FALLBACK_MODELS = [
  { id: 'deepseek-v4-flash', description: 'Fast & efficient' },
  { id: 'deepseek-v4-pro', description: 'Most capable' },
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [models, setModels] = useState(FALLBACK_MODELS);
  const [model, setModel] = useState('deepseek-v4-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [guardrailAlert, setGuardrailAlert] = useState(null);
  const streamingRef = useRef('');

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

  const sendMessage = useCallback(
    async (content) => {
      if (isStreaming) return;
      setGuardrailAlert(null);

      const userMsg = { role: 'user', content };
      const history = [...messages, userMsg];
      setMessages([...history, { role: 'assistant', content: '', streaming: true }]);
      setIsStreaming(true);
      streamingRef.current = '';

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            model,
            temperature,
            max_tokens: maxTokens,
            stream: true,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          if (err.detail?.error === 'guardrail_violation') {
            setGuardrailAlert(`[${err.detail.scanner}] ${err.detail.reason}`);
          } else {
            setGuardrailAlert(err.detail || 'API request failed');
          }
          setMessages(history);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                setGuardrailAlert(data.error);
                break;
              }
              if (data.done) break;
              if (data.content) {
                streamingRef.current += data.content;
                const snap = streamingRef.current;
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = { role: 'assistant', content: snap, streaming: true };
                  return next;
                });
              }
            } catch {
              // malformed SSE line — skip
            }
          }
        }

        // Mark streaming done
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === 'assistant') {
            next[next.length - 1] = { role: 'assistant', content: last.content, streaming: false };
          }
          return next;
        });
      } catch (err) {
        setGuardrailAlert(err.message || 'Connection failed');
        setMessages(history);
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, messages, model, temperature, maxTokens]
  );

  const clearConversation = useCallback(() => {
    setMessages([]);
    setGuardrailAlert(null);
  }, []);

  return (
    <div className="flex h-screen bg-night-900 text-slate-200 overflow-hidden">
      <Sidebar
        model={model}
        models={models}
        temperature={temperature}
        maxTokens={maxTokens}
        onModelChange={setModel}
        onTemperatureChange={setTemperature}
        onMaxTokensChange={setMaxTokens}
        onClear={clearConversation}
      />
      <ChatWindow
        messages={messages}
        isStreaming={isStreaming}
        onSend={sendMessage}
        guardrailAlert={guardrailAlert}
        onDismissAlert={() => setGuardrailAlert(null)}
      />
    </div>
  );
}
