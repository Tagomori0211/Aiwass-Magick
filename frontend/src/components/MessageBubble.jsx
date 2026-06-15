import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

function UserBubble({ content }) {
  return (
    <div className="flex justify-end animate-fade-in">
      <div className="max-w-[75%] bg-violet-muted border border-violet-accent/30 text-slate-100 rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words">
        {content}
      </div>
    </div>
  );
}

function AssistantBubble({ content, streaming }) {
  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-night-700 border border-violet-accent/40 flex items-center justify-center text-sm mt-0.5">
        ✦
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        {content ? (
          <div className={`md-content text-slate-200 text-sm ${streaming ? 'cursor-blink' : ''}`}>
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
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex gap-1 items-center h-6 mt-1">
            <span className="w-1.5 h-1.5 bg-violet-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-violet-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-violet-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessageBubble({ message }) {
  if (message.role === 'user') {
    return <UserBubble content={message.content} />;
  }
  return <AssistantBubble content={message.content} streaming={message.streaming} />;
}
